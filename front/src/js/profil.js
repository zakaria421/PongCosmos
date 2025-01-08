import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";
import { sanitizeInput, sanitizeObject } from "./main.js";

export function initProfilPage() {
  let isRefreshing = false; // Flag to track if token refresh is in progress
  let refreshAttempts = 0; // Retry counter for token refresh attempts
  const maxRefreshAttempts = 100; // Maximum number of attempts to refresh token
  let token = localStorage.getItem("jwtToken");
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh");

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch("https://10.12.8.11:8443/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        return null;
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
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("refresh");

      syncSession();
      navigateTo("login");
    }
  }
  let userName = "";
  let userProfilPicture = "";
  let userId = 0;
  document.querySelectorAll('img, p, a, div, button').forEach(function (element) {
    element.setAttribute('draggable', 'false');
  });
  const switchCheckbox = document.getElementById("2fa-switch");
  let isEditing = false;

  const friendsContainer = document.getElementById("friendsContainer");

  const bio = document.getElementById("profileBio");
  const maxLength = 100;

  bio.addEventListener("input", function handlep() {
    eventRegistry.push({
      element: bio,
      eventType: "input",
      handler: handlep
    });
    // Trim extra characters if exceeded
    if (bio.textContent.length > maxLength) {
      bio.textContent = bio.textContent.slice(0, maxLength);
      placeCaretAtEnd(bio); // Reposition the cursor
    }
  });

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
              <img src="https://10.12.8.11:8443/${friend.profile_picture}" alt="${friend.nickname
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
                          https://10.12.8.11:8443/${match.opponent_profile_picture}
                        " alt="" class="enemy-icon">
                    </div>
                </div>
            </div>
        `;
    return card;
  }

  async function displayMatchHistory() {

    const matchHistoryContainer = document.getElementById("matchHistory");
    try {
      let response = await fetch(`https://10.12.8.11:8443/api/profile/matchHistory?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      if (response.ok) {
        const toSanitize = await response.json();
        let userData = sanitizeObject(toSanitize);
        let matchDatas = userData.match_details;
        if (matchDatas.length == 0) {
          document.getElementById("notyet").style.display = "block";
        }
        else {
          document.getElementById("notyet").style.display = "none";
          const recentMatches = matchDatas.slice(0, 10);
          recentMatches.forEach((match) => {
            const matchCard = createMatchCard(match);
            matchHistoryContainer.appendChild(matchCard);
          });
        }
      }
      else if (response.status === 401) {
        if (refreshAttempts < maxRefreshAttempts) {
            isRefreshing = true;
            refreshAttempts++;

            token = await refreshAccessToken();

            if (token) {
                return displayMatchHistory();
            } else {
                localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

                syncSession();
                navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
            }
        } else {
            localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

            syncSession();
            navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
        }
    }
    } catch (err) {
      console.log("error", err);
    }
  }

  async function fetchUserData() {
    try {
      let response = await fetch("https://10.12.8.11:8443/api/userinfo/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      if (response.ok) {
        const toSanitize = await response.json();
        let userData = sanitizeObject(toSanitize);

        let profilePicture = "https://10.12.8.11:8443/" + userData.profile_picture;
        switchCheckbox.checked = userData.is_2fa_enabled;

        updateUserDisplay(userData, profilePicture);
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
        renderFriends(userData.friends);
        attachUserMenuListeners();
        displayMatchHistory();
      } else if (response.status === 401) {
        if (refreshAttempts < maxRefreshAttempts) {
          refreshAttempts++; // Increment retry counter

          token = await refreshAccessToken();

          if (token) {
            return fetchUserData(); // Retry fetching data with the new token
          } else {
            // Refresh token failed, log out user
            localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

            syncSession();
            navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
          }
        } else {
          // Too many refresh attempts or token refresh failed
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
      navigateTo("error", { message: err.message });
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

  fetchUserData();
  // Edit profile logic
  async function handlehg() {
    isEditing = !isEditing;

    if (isEditing) {
      document
        .getElementById("profileName")
        .setAttribute("contenteditable", "true");
      document
        .getElementById("profileBio")
        .setAttribute("contenteditable", "true");
      document.getElementById("profileImage").style.cursor = "pointer";
      document.getElementById("profileImage").classList.add("editable");
      document.getElementById("editImageIcon").style.display = "block";
      this.innerHTML = '<i class="fas fa-save me-2"></i>Save Profile';

      document.getElementById("profileName").focus();
      const profileName = document.getElementById("profileName");
      profileName.addEventListener("input", () => {
        if (profileName.textContent.length > 8) {
          profileName.textContent = profileName.textContent.slice(0, 8);
          placeCaretAtEnd(profileName);
        }
      });
      profileName.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    });
      function placeCaretAtEnd(el) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      const updatedName = sanitizeInput(document.getElementById("profileName").textContent);
      const updatedBio = sanitizeInput(document.getElementById("profileBio").textContent);
      await updateProfile(updatedName, updatedBio);
      saveImage();

      document
        .getElementById("profileName")
        .setAttribute("contenteditable", "false");
      document
        .getElementById("profileBio")
        .setAttribute("contenteditable", "false");
      document.getElementById("profileImage").style.cursor = "not-allowed";
      document.getElementById("profileImage").classList.remove("editable");
      document.getElementById("editImageIcon").style.display = "none";
      this.innerHTML = '<i class="fas fa-pencil-alt me-2"></i>Edit Profile';
    }
  }
  document.getElementById("editProfileBtn").addEventListener("click", handlehg);
  eventRegistry.push({
    element: document.getElementById("editProfileBtn"),
    eventType: "click",
    handler: handlehg
  });

  async function updateProfile(updatedName, updatedBio) {
    try {
      const response = await fetch("https://10.12.8.11:8443/api/profile/update/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname: updatedName, bio: updatedBio }),
      });

      if (response.ok) {
        const toSanitize = await response.json();
        const userData = sanitizeObject(toSanitize);
        document.getElementById("profileName").textContent = userData.nickname;
        document.getElementById("profileN").textContent = userData.nickname;
      } else if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          await updateProfile(updatedName, updatedBio);
        } else {
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");
          syncSession();
          navigateTo("login");
        }
      } else if (response.status === 400) {
        const name = sanitizeInput(document.getElementById("profileN").textContent);
        document.getElementById("profileName").textContent = name;
        alert("Username already taken !");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }

  document
    .getElementById("profileImage")
    .addEventListener("click", function handlepl() {
      eventRegistry.push({
        element: document.getElementById("profileImage"),
        eventType: "click",
        handler: handlepl
      });
      if (isEditing) {
        document.getElementById("fileInput").click();
      }
    });

  let selectedFile = null;

  function handlepls(event) {
    event.preventDefault();

    const file = event.target.files[0];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, GIF).");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size exceeds the limit of 5MB.");
      return;
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onloadend = function () {
      document.getElementById("profileImage").src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function saveImage() {
    if (selectedFile) {
      let formData = new FormData();
      formData.append("profile_picture", selectedFile);

      const token = sanitizeInput(localStorage.getItem("jwtToken"));
      if (!token) {
        navigateTo("error", { message: "Missing or invalid token." });
        return;
      }

      fetch("https://10.12.8.11:8443/api/profile/update/picture/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error uploading image. Please try again.");
          }
          return response.json();
        })
        .then((userData) => {
          const imageUrl = "https://10.12.8.11:8443/" + sanitizeInput(userData.profile_picture);
          document.getElementById("profilePicture").src = imageUrl;
          document.getElementById("profileImage").src = imageUrl;
          selectedFile = null;
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  }


  document.getElementById("fileInput").addEventListener("change", handlepls);
  eventRegistry.push({
    element: document.getElementById("fileInput"),
    eventType: "change",
    handler: handlepls
  });
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

  function attachUserMenuListeners() {
    const userContainer = document.getElementById("toggler");
    const userMenu = document.getElementById("user-menu");
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
        navigateTo("profil");
      }

      if (clickedItem.querySelector("#log-out")) {
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
      if (event.target.classList.contains("input")) {
        const checkbox = event.target;
        const isChecked = checkbox.checked;
        const action = isChecked ? "enable" : "disable";

        try {
          const response = await fetch(`https://10.12.8.11:8443/api/2fa/${action}/`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            console.log(`2FA ${action}d successfully.`);
          } else if (response.status === 401) {    
            if (refreshAttempts < maxRefreshAttempts) {
              isRefreshing = true;
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
              localStorage.removeItem("jwtToken");
          localStorage.removeItem("refresh");

              syncSession();
              navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
            }
          }
          else {
            checkbox.checked = !isChecked; // Revert state if request fails
          }
        } catch (error) {
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
  // }
  /******************************************************************************** */
}
