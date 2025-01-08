import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";
import { sanitizeInput, sanitizeObject } from "./main.js";

export function initLeaderboardPage() {
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
      const response = await fetch("https://0.0.0.0:8443/api/token/refresh/", {
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
  document.querySelectorAll('img, p, a, div, button').forEach(function (element) {
    element.setAttribute('draggable', 'false');
  });
  const switchCheckbox = document.getElementById("2fa-switch");
  /*------------------------------------- Render User -------------- */
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
  /*------------------------------------- LeaderBoard -------------- */
  let leaderboardData = [];
  function createPodiumItem(user, place) {
    // Determine the color based on the rank
    let color;
    switch (place) {
        case 1:
            color = "#ffaf00";
            break;
        case 2:
            color = "#189cfd";
            break;
        case 3:
            color = "#9201fe";
            break;
        default:
            color = "black";
    }

    const podiumItem = document.createElement('div');
    podiumItem.classList.add('podium-item', `podium-${place}`);

    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add('avatar-container');

    const avatarBorder = document.createElement('img');
    avatarBorder.classList.add('avatar-border');
    avatarBorder.src = `src/assets/leaderboard/rank${place}.png`;
    avatarBorder.alt = '';

    const avatar = document.createElement('img');
    avatar.classList.add('avatar');
    avatar.src = `https://0.0.0.0:8443${user.profile_picture}`;
    avatar.alt = user.nickname;

    const name = document.createElement('div');
    name.classList.add('name');
    name.textContent = user.nickname;

    const podiumBlock = document.createElement('div');
    podiumBlock.classList.add('podium-block');

    const podiumStats = document.createElement('div');
    podiumStats.classList.add('podium-stats');

    const wins = document.createElement('div');
    wins.classList.add('wins');
    
    const winText = document.createElement('span');
    winText.textContent = user.wins;

    const winLabel = document.createElement('span');
    winLabel.style.color = color;
    winLabel.textContent = 'Win';

    wins.appendChild(winText);
    wins.appendChild(document.createElement('br'));
    wins.appendChild(winLabel);

    const rank = document.createElement('div');
    rank.classList.add('rank', `rank-${place}`);
    rank.textContent = place;

    const level = document.createElement('div');
    level.classList.add('level');

    const levelText = document.createElement('span');
    levelText.textContent = user.level;

    const levelLabel = document.createElement('span');
    levelLabel.style.color = color;
    levelLabel.textContent = 'level';

    level.appendChild(levelText);
    level.appendChild(document.createElement('br'));
    level.appendChild(levelLabel);

    avatarContainer.appendChild(avatarBorder);
    avatarContainer.appendChild(avatar);
    podiumStats.appendChild(wins);
    podiumStats.appendChild(rank);
    podiumStats.appendChild(level);
    podiumBlock.appendChild(podiumStats);
    podiumItem.appendChild(avatarContainer);
    podiumItem.appendChild(name);
    podiumItem.appendChild(podiumBlock);

    return podiumItem;
}



function createLeaderboardItem(user, index) {
  const isTopThree = index < 3;

  const rankClass = isTopThree ? `rank rank-${index + 1} top-three` : '';
  const avatarClass = isTopThree ? 'top-three-avatar' : 'regular-avatar';

  return `
      <li class="list-group-item d-flex align-items-center"> 
          <span class="fw-bold me-3 ${rankClass}">
              ${index + 1}
          </span>
          <div class="line-horizontal"></div>
          <img src="https://0.0.0.0:8443${user.profile_picture}" 
               alt="${user.nickname}" 
               class="rounded-circle me-3 ${avatarClass}">
          <div class="flex-grow-1">
              <div class="fw-semibold">${user.nickname}</div>
              <div class="text-muted small font">Level ${user.level}</div>
          </div>
          <div class="text-muted font">${user.wins} Win</div>
      </li>
  `;
}


  async function renderLeaderboard() {
    const podium = document.getElementById("podium");
    podium.innerHTML = '';
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = '';
    try {
      const response = await fetch("https://0.0.0.0:8443/api/topplayers/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (response.ok) {
        const toSanitize = await response.json();
        let data = sanitizeObject(toSanitize);
        leaderboardData = data;
        // Render podium with order: 2nd, 1st, 3rd
        if (leaderboardData && leaderboardData.length > 2) {
          document.getElementById("notEnough").classList.add("d-none");
          document.getElementById("leftOne").style.display = 'block';
          document.getElementById("rightOne").style.display = 'block';
          podium.innerHTML = '';
          const rankOrder = [
            { rank: 2, data: leaderboardData[1] },
            { rank: 1, data: leaderboardData[0] },
            { rank: 3, data: leaderboardData[2] }
          ];

          // Loop through the rankOrder array to append podium items in the desired order
          rankOrder.forEach(( { rank, data }) => {
            const podiumItem = createPodiumItem(data, rank);
            podium.appendChild(podiumItem);
          });

          // Render leaderboard list
          const leaderboardHtml = leaderboardData
            .map((user, index) => {
              if (window.innerWidth > 991) {
                // On large screens, exclude top 3 from the table
                return index > 2 ? createLeaderboardItem(user, index) : "";
              } else {
                // On small screens, include all players in the table
                return createLeaderboardItem(user, index);
              }
            })
            .join("");
          leaderboardList.innerHTML = leaderboardHtml;
        }
        else {
          document.getElementById("notEnough").classList.remove("d-none");
          document.getElementById("leftOne").style.display = 'none';
          document.getElementById("rightOne").style.display = 'none';
        }
      } else if (response.status === 401) {
        if (refreshAttempts < maxRefreshAttempts) {
          refreshAttempts++;
          token = await refreshAccessToken();

          if (token) {
            return renderLeaderboard();
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
    } catch (error) {
      console.log(error);
    }
  }

  renderLeaderboard();

  // Re-render on window resize to handle responsive behavior
  window.addEventListener("resize", renderLeaderboard);
  eventRegistry.push({
    element: window,
    eventType: "resize",
    handler: renderLeaderboard
  });
  /**------------------------------------------------------------- */
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
        const profilePicture = "https://0.0.0.0:8443" + sanitizeInput(userData.profile_picture);
        switchCheckbox.checked = userData.is_2fa_enabled;
        updateUserDisplay(userData, profilePicture);
        attachUserMenuListeners();
      } else if (response.status === 401) {
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

  // Function to attach event listeners when elements exist
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
          const response = await fetch(`https://0.0.0.0:8443/api/2fa/${action}/`, {
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
              refreshAttempts++;
              token = await refreshAccessToken();
    
              if (token) {
                return handlehone();
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
}
