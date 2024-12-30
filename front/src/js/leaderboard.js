import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";

export function initLeaderboardPage() {
  let isRefreshing = false; // Flag to track if token refresh is in progress
  let refreshAttempts = 0; // Retry counter for token refresh attempts
  const maxRefreshAttempts = 10; // Maximum number of attempts to refresh token
  let token = localStorage.getItem("jwtToken");
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh");

    if (!refreshToken) {
      console.error("No refresh token found.");
      return null;
    }

    try {
      const response = await fetch("http://0.0.0.0:8000/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        console.error("Failed to refresh token");
        return null;
      }

      const data = await response.json();
      const newAccessToken = data.access;
      localStorage.removeItem("jwtToken");
      syncSession();
      localStorage.setItem("jwtToken", newAccessToken);
      token = localStorage.getItem("jwtToken");
      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      localStorage.removeItem("jwtToken");
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
    return `
        <button class="user btn p-2 no-border">
          <div class="d-flex align-items-center gap-2">
            <!-- Profile Image -->
            <div id="toggler">
            <div class="users-container">
              <img src="./src/assets/home/border.png" alt="" class="users-border">
              <img src="${profilePicture}" alt="Profile Image" class="rounded-circle users" id="profilePicture">
              <p class="levels text-white text-decoration-none" draggable="false">
                  <strong draggable="false">${userData.level}</strong>
                </p>
              </div>

            <!-- User Name -->
            <div class="UserProfile">
              <p class="text-white text-decoration-none" id="profileN">
                <strong>${userData.nickname}</strong>
              </p>
            </div>
            </div>

            <!-- Notification Icon -->
            <div class="Notifications">
              <i class="bi bi-bell-fill text-white"></i>
            </div>
          </div>
        </button>
    `;
  }


  function updateUserDisplay(userData, profilePicture) {
    const userProfileButtonContainer = document.getElementById("user-profile-button");
    userProfileButtonContainer.innerHTML = renderUser(userData, profilePicture);
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
            color = "black"; // Default color if rank is higher than 3
    }

    // Create the elements for the podium item
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
    avatar.src = `http://0.0.0.0:8000${user.profile_picture}`;
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
    
    // Create win label text
    const winText = document.createElement('span');
    winText.textContent = user.wins;

    // Create a colorized label for 'Win'
    const winLabel = document.createElement('span');
    winLabel.style.color = color;
    winLabel.textContent = 'Win';

    // Append them to wins div
    wins.appendChild(winText);
    wins.appendChild(document.createElement('br')); // Add a line break
    wins.appendChild(winLabel);

    const rank = document.createElement('div');
    rank.classList.add('rank', `rank-${place}`);
    rank.textContent = place;

    const level = document.createElement('div');
    level.classList.add('level');

    // Create level label text
    const levelText = document.createElement('span');
    levelText.textContent = user.level;

    // Create a colorized label for 'level'
    const levelLabel = document.createElement('span');
    levelLabel.style.color = color;
    levelLabel.textContent = 'level';

    // Append them to level div
    level.appendChild(levelText);
    level.appendChild(document.createElement('br')); // Add a line break
    level.appendChild(levelLabel);

    // Append elements together
    avatarContainer.appendChild(avatarBorder);
    avatarContainer.appendChild(avatar);
    podiumStats.appendChild(wins);
    podiumStats.appendChild(rank);
    podiumStats.appendChild(level);
    podiumBlock.appendChild(podiumStats);
    podiumItem.appendChild(avatarContainer);
    podiumItem.appendChild(name);
    podiumItem.appendChild(podiumBlock);

    return podiumItem; // Return the created element
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
          <img src="http://0.0.0.0:8000${user.profile_picture}" 
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
    podium.innerHTML = ''; // Ensure it's empty before adding new items
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = '';
    // let leaderboardData = [];
    try {
      const response = await fetch("http://0.0.0.0:8000/topplayers/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (response.ok) {
        const data = await response.json();
        leaderboardData = data;
        // Render podium with order: 2nd, 1st, 3rd
        if (leaderboardData && leaderboardData.length > 2) {
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
            console.log(rank, data);
            const podiumItem = createPodiumItem(data, rank);
            podium.appendChild(podiumItem);
          });

          // Render leaderboard list
          const leaderboardHtml = leaderboardData
            .map((user, index) => {
              if (window.innerWidth > 991) {
                // On large screens, exclude top 3 from the table
                return index > 4 ? createLeaderboardItem(user, index) : "";
              } else {
                // On small screens, include all players in the table
                return createLeaderboardItem(user, index);
              }
            })
            .join("");
          leaderboardList.innerHTML = leaderboardHtml;
        }
        else {
          console.log("entered here : ");
          document.getElementById("notEnough").style.display = "block";
          document.getElementById("leftOne").style.display = 'none';
          document.getElementById("rightOne").style.display = 'none';
        }
      } else if (response.status === 401) {
        console.log("Access token expired. Refreshing token...");
        token = await refreshAccessToken();

        if (token) {
          return renderLeaderboard();
        } else {
          console.error("Unable to refresh access token. Please log in again.");
          localStorage.removeItem("jwtToken");
          syncSession();
          navigateTo("login");
        }
      }
      else {
        console.error("Failed to fetch user data:", response.statusText);
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
      let response = await fetch("http://0.0.0.0:8000/userinfo/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });

      if (response.ok) {
        const userData = await response.json();
        const profilePicture = "http://0.0.0.0:8000/" + userData.profile_picture;
        switchCheckbox.checked = userData.is_2fa_enabled;
        updateUserDisplay(userData, profilePicture);
        attachUserMenuListeners();
      } else if (response.status === 401) {
        console.log("Access token expired. Refreshing token...");

        if (!isRefreshing && refreshAttempts < maxRefreshAttempts) {
          isRefreshing = true; // Lock refresh to prevent infinite loop
          refreshAttempts++; // Increment retry counter

          token = await refreshAccessToken();

          if (token) {
            // Save the new token and reset the refresh state
            localStorage.setItem("jwtToken", token);
            isRefreshing = false;
            return fetchUserData(); // Retry fetching data with the new token
          } else {
            // Refresh token failed, log out user
            localStorage.removeItem("jwtToken");
            syncSession();
            navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
          }
        } else {
          // Too many refresh attempts or token refresh failed
          console.error("Failed to refresh token after multiple attempts.");
          localStorage.removeItem("jwtToken");
          syncSession();
          navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
        }
      } else {
        console.error("Error fetching user data:", err);
        localStorage.removeItem("jwtToken");
        syncSession();
        navigateTo("error", { message: err.message });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
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
          const response = await fetch(`http://0.0.0.0:8000/2fa/${action}/`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            console.log(`2FA ${action}d successfully.`);
          } else {
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
}
