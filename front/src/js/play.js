import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";
import { sanitizeInput, sanitizeObject } from "./main.js";

export function initPlayPage() {
  let refreshAttempts = 0;
  const maxRefreshAttempts = 100;
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
  const modeItems = document.querySelectorAll(".mode-item");
  const confirmButton = document.getElementById("confirmButton");
  const switchCheckbox = document.getElementById("2fa-switch");

  modeItems.forEach((item) => {
    const image = item.querySelector(".mode-image");
    const description = item.querySelector(".mode-description");

    image.addEventListener("click", function handleyw() {
      eventRegistry.push({
        element: image,
        eventType: "click",
        handler: handleyw
      });
      // Hide all descriptions first
      document.querySelectorAll(".mode-description").forEach((desc) => {
        desc.classList.remove("active");
      });

      // Show clicked item's description
      description.classList.add("active");
    });
  });

  confirmButton.addEventListener("click", function handley() {
    eventRegistry.push({
      element: confirmButton,
      eventType: "click",
      handler: handley
    });
    const activeMode = document.querySelector(".mode-description.active");
    if (activeMode) {
      let modeName =
        activeMode.parentElement.querySelector(".mode-title").textContent;
        navigateTo('game', { mode: modeName });
    } else {
      alert("Please select a game mode first!");
    }
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
        if (refreshAttempts < maxRefreshAttempts) {
          refreshAttempts++;

          token = await refreshAccessToken();

          if (token) {
            // Save the new token and reset the refresh state
            localStorage.setItem("jwtToken", token);
            return fetchUserData(); // Retry fetching data with the new token
          } else {
            // Refresh token failed, log out user
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

    async function handlel(event) {
      const clickedItem = event.target.closest('.dropdown-item');

      if (!clickedItem) return;

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
          } else {
            checkbox.checked = !isChecked;
          }
        } catch (error) {
          checkbox.checked = !isChecked;
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