import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";
import { sanitizeInput, sanitizeObject } from "./main.js";

export function initOtherUserPage(name) {
  let isRefreshing = false; // Flag to track if token refresh is in progress
  let refreshAttempts = 0; // Retry counter for token refresh attempts
  const maxRefreshAttempts = 100; // Maximum number of attempts to refresh token
  let token = localStorage.getItem("jwtToken");
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh");

    if (!refreshToken) {
      console.error("No refresh token found.");
      return null;
    }

    try {
      const response = await fetch("https://0.0.0.0:8443/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        console.error("Failed to refresh token");
        return null; // Return null if refresh fails
      }

      const data = await response.json();
      const sanitizedData = sanitizeObject(data);
      const newAccessToken = sanitizedData.access;
      localStorage.removeItem("jwtToken");
      syncSession();
      localStorage.setItem("jwtToken", newAccessToken);
      token = localStorage.getItem("jwtToken");

      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("refresh");

      syncSession();
      navigateTo("login");
    }
  }

  let userName = "";
  let userProfilPicture = "";
  let userId = 0;
  let matches = {};

  document.querySelectorAll('img, p, a, div, button').forEach(function (element) {
    element.setAttribute('draggable', 'false');
  });

  const switchCheckbox = document.getElementById("2fa-switch");
  let isEditing = false;

  const friendsContainer = document.getElementById("friendsContainer");

  // Helper function to place caret at the end of contenteditable
  function placeCaretAtEnd(el) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // Sort friends by status (online first)
  // friends.sort((a, b) => (a.status === "offline") - (b.status === "offline"));

  // Populate Friends List
  function renderFriends(friends) {
    friends.forEach((friend) => {
      const div = document.createElement("div");
      div.className = "friend-item";
      div.innerHTML = `
              <img src="https://0.0.0.0:8443/${friend.profile_picture}" alt="${friend.nickname
        }" class="friend-picture">
              <div>
                  <p class="friend-name">${friend.nickname}</p>
                  <span class="friend-status ${friend.status}">
                      <span class="status-indicator"></span>

                  </span>
              </div>
          `;
      friendsContainer.appendChild(div);
    });
  }

  // ${
  //   friend.status.charAt(0).toUpperCase() +
  //   friend.status.slice(1)
  // }
  // Match History (last 10 games)


  function createMatchCard(match) {
    const playerWon = match.score > match.opponent_score;
    const card = document.createElement("div");
    card.className = "match-card";
    card.innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-12 col-sm-5 d-flex flex-column flex-sm-row align-items-center justify-content-start mb-3 mb-sm-0">
                        <img src="${userProfilPicture
      }" alt="" class="player-icon mb-2 mb-sm-0 me-sm-2">
                        <h5 class="player-name ${playerWon ? "winner" : "loser"
      }">${userName}</h5>
                    </div>
                    <div class="col-12 col-sm-2 text-center mb-3 mb-sm-0">
                        <div class="score">${match.score} - ${match.opponent_score
      }</div>
                    </div>
                    <div class="col-12 col-sm-5 d-flex flex-column flex-sm-row align-items-center justify-content-end">
                        <h5 class="enemy-name ${playerWon ? "loser" : "winner"
      } mb-2 mb-sm-0 me-sm-2">${match.opponent_name}</h5>
                        <img src="
                          https://0.0.0.0:8443/${match.opponent_profile_picture}
                        " alt="" class="enemy-icon">
                    </div>
                </div>
            </div>
        `;
    return card;
  }

  async function displayMatchHistory() {
    console.log("LENGTH: ", matches.length);

    const matchHistoryContainer = document.getElementById("matchHistory");
    // matchHistoryContainer.innerHTML = "";
    if (matches.length == 0) {
      document.getElementById("notyet").style.display = "block";
    }
    else {
      document.getElementById("notyet").style.display = "none";
      const recentMatches = matches.slice(0, 10);
      recentMatches.forEach((match) => {
        const matchCard = createMatchCard(match);
        matchHistoryContainer.appendChild(matchCard);
      });
    }
    // Get the last 10 games from matchData
  }
  /**
   * ------------------------------------------------------------------
   */
  async function fetchUserData() {
    try {
      let response = await fetch("https://0.0.0.0:8443/api/userinfo/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });

      if (response.ok) {
        const toSanitize = await response.json();
        const userData = sanitizeObject(toSanitize);
        const profilePicture = "https://0.0.0.0:8443/" + userData.profile_picture;
        switchCheckbox.checked = userData.is_2fa_enabled;
        updateUserDisplay(userData, profilePicture);
        attachUserMenuListeners();
      } else if (response.status === 401) {
        console.log("Access token expired. Refreshing token...");

        if (refreshAttempts < maxRefreshAttempts) {
          refreshAttempts++;
          token = await refreshAccessToken();

          if (token) {
            return fetchUserData();
          } else {
            localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

            syncSession();
            navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
          }
        } else {
          console.error("Failed to refresh token after multiple attempts.");
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

          syncSession();
          navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
        }
      } else {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("refresh");
        navigateTo("error", { message: "Error fetching, please relog" });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      navigateTo("error", { message: err.message });
    }
  }

  async function fetchProfilPlayer() {
    console.log(token);
    try {
      let response = await fetch(`https://0.0.0.0:8443/api/user-profile/${name}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });
      if (response.ok) {
        const toSanitize = await response.json();
        let userData = sanitizeObject(toSanitize);
        console.log(userData);
        // Decrypt the profile picture and update the user display
        let profilePicture = "https://0.0.0.0:8443/" + userData.profile_picture;
        document.getElementById("profileName").textContent = userData.nickname;
        document.getElementById("profileBio").textContent = userData.bio;
        document.getElementById("profileImage").src = profilePicture;
        document.getElementById("wins").textContent = userData.wins;
        document.getElementById("losses").textContent = userData.losses;
        document.getElementById("level").textContent = userData.level;
        document.getElementById("levels").textContent += userData.level;
        userName = userData.nickname;
        userProfilPicture = profilePicture;
        userId = userData.id;
        matches = userData.match_details;
        renderFriends(userData.friends);
        displayMatchHistory();

      }  else if (response.status === 401) {
        console.log("Access token expired. Refreshing token...");

        if (refreshAttempts < maxRefreshAttempts) {
          refreshAttempts++;
          token = await refreshAccessToken();

          if (token) {
            return fetchProfilPlayer();
          } else {
            localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

            syncSession();
            navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
          }
        } else {
          console.error("Failed to refresh token after multiple attempts.");
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

          syncSession();
          navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
        }
      }
      else {
        console.log("ERROR : 11");
        navigateTo("error", { message: "User can not be found !" });
      }
    } catch (err) {
      console.log("ERROR : 22");
      navigateTo("error", { message: "User can not be found !!" });
    }
  }

  function renderUser(userData, profilePicture) {
    const sanitizedNickname = sanitizeInput(userData.nickname);
    const sanitizedLevel = sanitizeInput(userData.level);

    // Create button
    const button = document.createElement("button");
    button.className = "user btn p-2 no-border";
    button.setAttribute("draggable", "false");

    // Create main container
    const container = document.createElement("div");
    container.className = "d-flex align-items-center gap-2";
    container.setAttribute("draggable", "false");
    button.appendChild(container);

    // Create profile image section
    const profileImageWrapper = document.createElement("div");
    profileImageWrapper.id = "toggler";
    profileImageWrapper.setAttribute("draggable", "false");
    container.appendChild(profileImageWrapper);

    const usersContainer = document.createElement("div");
    usersContainer.className = "users-container";
    usersContainer.setAttribute("draggable", "false");
    profileImageWrapper.appendChild(usersContainer);

    const borderImg = document.createElement("img");
    borderImg.src = "./src/assets/home/border.png";
    borderImg.alt = "";
    borderImg.className = "users-border";
    borderImg.setAttribute("draggable", "false");
    usersContainer.appendChild(borderImg);

    const profileImg = document.createElement("img");
    profileImg.src = profilePicture;
    profileImg.alt = "Profile Image";
    profileImg.className = "rounded-circle users";
    profileImg.id = "profilePicture";
    profileImg.setAttribute("draggable", "false");
    usersContainer.appendChild(profileImg);

    const levelParagraph = document.createElement("p");
    levelParagraph.className = "level text-white text-decoration-none";
    levelParagraph.setAttribute("draggable", "false");
    const levelStrong = document.createElement("strong");
    levelStrong.setAttribute("draggable", "false");
    levelStrong.textContent = sanitizedLevel;
    levelParagraph.appendChild(levelStrong);
    usersContainer.appendChild(levelParagraph);

    // Create user name section
    const userProfile = document.createElement("div");
    userProfile.className = "UserProfile";
    userProfile.setAttribute("draggable", "false");
    container.appendChild(userProfile);

    const nicknameParagraph = document.createElement("p");
    nicknameParagraph.className = "text-white text-decoration-none";
    nicknameParagraph.id = "profileN";
    nicknameParagraph.setAttribute("draggable", "false");
    const nicknameStrong = document.createElement("strong");
    nicknameStrong.setAttribute("draggable", "false");
    nicknameStrong.textContent = sanitizedNickname;
    nicknameParagraph.appendChild(nicknameStrong);
    userProfile.appendChild(nicknameParagraph);

    // Create notification icon
    const notificationsDiv = document.createElement("div");
    notificationsDiv.className = "Notifications";
    notificationsDiv.setAttribute("draggable", "false");
    const notificationIcon = document.createElement("i");
    notificationIcon.className = "bi bi-bell-fill text-white";
    notificationIcon.setAttribute("draggable", "false");
    notificationsDiv.appendChild(notificationIcon);
    container.appendChild(notificationsDiv);

    return button;
  }

  function updateUserDisplay(userData, profilePicture) {
    const userProfileButtonContainer = document.getElementById("user-profile-button");

    // Clear existing content
    userProfileButtonContainer.replaceChildren(); // Clears all child nodes

    // Render new user profile button
    const userProfileButton = renderUser(userData, profilePicture);
    userProfileButtonContainer.appendChild(userProfileButton);
  }

  console.log("displayed twice for some reason: ");
  fetchUserData();

  /******************************************************************************** */
  const homebtn = document.getElementsByClassName("home");
  if (homebtn[0]) {
    function handlea(event) {
      event.preventDefault();
      navigateTo("home");
    };
    homebtn[0].addEventListener("click", handlea);
    eventRegistry.push({
      element: homebtn[0],
      eventType: "click",
      handler: handlea
    });
  }

  const homeButton = document.getElementById("home");
  if (homeButton) {
    function handleb(event) {
      event.preventDefault();
      navigateTo("home");
    };
    homeButton.addEventListener("click", handleb);
    eventRegistry.push({
      element: homeButton,
      eventType: "click",
      handler: handleb
    });
  }

  const leaderboardButton = document.getElementById("leaderboard");
  if (leaderboardButton) {
    function Handlec(event) {
      event.preventDefault();
      navigateTo("leaderboard");
    };
    leaderboardButton.addEventListener("click", Handlec);
    eventRegistry.push({
      element: leaderboardButton,
      eventType: "click",
      handler: Handlec
    });
  }

  const aboutButton = document.getElementById("about");
  if (aboutButton) {
    function handled(event) {
      event.preventDefault();
      navigateTo("about");
    };
    aboutButton.addEventListener("click", handled);
    eventRegistry.push({
      element: aboutButton,
      eventType: "click",
      handler: handled
    });
  }
  // if (document.getElementsByClassName("profil")) {
  // const profilButton = document.getElementsByClassName("profil");
  // if (profilButton[0]) {
  //   profilButton[0].addEventListener("click", function (event) {
  //     event.preventDefault();
  //     navigateTo("profil");
  //   });
  // }
  // Function to attach event listeners when elements exist
  function attachUserMenuListeners() {
    const userContainer = document.getElementById("toggler");
    const userMenu = document.getElementById("user-menu");
    console.log(userMenu, "WWAAAAAAWW", userContainer);
    if (userContainer && userMenu) {
      function handlej(event) {
        userMenu.classList.toggle("visible");
        if (userMenu.classList.contains("visible")) {
          userMenu.classList.remove("hidden");
        }
      }
      userContainer.addEventListener("click", handlej);
      eventRegistry.push({
        element: userContainer,
        eventType: "click",
        handler: handlej
      });

      // Close dropdown menu when clicking outside of the user container
      function handlek(event) {
        if (!userMenu.contains(event.target) && !userContainer.contains(event.target)) {
          userMenu.classList.remove("visible");
          userMenu.classList.add("hidden");
        }
      }
      window.addEventListener("click", handlek);
      eventRegistry.push({
        element: window,
        eventType: "click",
        handler: handlek
      });
    }

    // Delegated event listener for "View Profile" and "Log Out" clicks
    async function handlel(event) {

      const clickedItem = event.target.closest('.dropdown-item');

      if (!clickedItem) return;

      // Check which specific dropdown item was clicked
      if (clickedItem.querySelector("#view-profile")) {
        console.log("Viewing profile...");
        navigateTo("profil");
      }

      if (clickedItem.querySelector("#log-out")) {
        console.log("Logging out...");
        localStorage.removeItem('jwtToken');
        syncSession();
        navigateTo("landing");
      }
    }
    document.body.addEventListener("click", handlel);
    eventRegistry.push({
      element: document.body,
      eventType: "click",
      handler: handlel
    });

    async function handlehone(event) {
      console.log("change event INSIDE");
      if (event.target.classList.contains("input")) {
        const checkbox = event.target;
        const isChecked = checkbox.checked;
        const action = isChecked ? "enable" : "disable";

        try {
          console.log("ACTION : ", action);
          const response = await fetch(`https://0.0.0.0:8443/2fa/${action}/`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            console.log(`2FA ${action}d successfully.`);
          } else if (response.status === 401) {
            console.log("Access token expired. Refreshing token...");
    
            if (refreshAttempts < maxRefreshAttempts) {
              refreshAttempts++;
              token = await refreshAccessToken();
    
              if (token) {
                return handlehone(event);
              } else {
                localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

                syncSession();
                navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
              }
            } else {
              console.error("Failed to refresh token after multiple attempts.");
              localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

              syncSession();
              navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
            }
          } 
          else {
            console.error("Request failed. Reverting switch state.");
            checkbox.checked = !isChecked; // Revert state if request fails
          }
        } catch (error) {
          console.error("Error occurred:", error);
          checkbox.checked = !isChecked; // Revert state if an error occurs
        }
      }
    }
    document.addEventListener("change", handlehone);
    eventRegistry.push({
      element: document,
      eventType: "change",
      handler: handlehone
    });
  }

  fetchProfilPlayer();
  // }
  /******************************************************************************** */
}