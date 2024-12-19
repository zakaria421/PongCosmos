import { navigateTo } from "./main.js";

export function initPlayPage() {
  const modeItems = document.querySelectorAll(".mode-item");
  const confirmButton = document.getElementById("confirmButton");

  modeItems.forEach((item) => {
    const image = item.querySelector(".mode-image");
    const description = item.querySelector(".mode-description");

    image.addEventListener("click", () => {
      // Hide all descriptions first
      document.querySelectorAll(".mode-description").forEach((desc) => {
        desc.classList.remove("active");
      });

      // Show clicked item's description
      description.classList.add("active");
    });
  });

  confirmButton.addEventListener("click", () => {
    const activeMode = document.querySelector(".mode-description.active");
    if (activeMode) {
      const modeName =
        activeMode.parentElement.querySelector(".mode-title").textContent;
        console.log("First one");
        navigateTo('game', { mode: modeName });
    } else {
      alert("Please select a game mode first!");
    }
  });
  /******************************************************************************** */
  const homebtn = document.getElementsByClassName("home");
  if (homebtn[0]) {
    homebtn[0].addEventListener("click", function (event) {
      event.preventDefault();
      navigateTo("home");
    });
  }
  
  const homeButton = document.getElementById("home");
  if (homeButton) {
    homeButton.addEventListener("click", function (event) {
      event.preventDefault();
      navigateTo("home");
    });
  }

  const leaderboardButton = document.getElementById("leaderboard");
  if (leaderboardButton) {
    leaderboardButton.addEventListener("click", function (event) {
      event.preventDefault();
      navigateTo("leaderboard");
    });
  }

  const aboutButton = document.getElementById("about");
  if (aboutButton) {
    aboutButton.addEventListener("click", function (event) {
      event.preventDefault();
      navigateTo("about");
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

  async function fetchUserData() {
    let token = sessionStorage.getItem("jwtToken");
    console.log(token);
    try {
      let response = await fetch("http://0.0.0.0:8000/userinfo/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      if (response.ok) {
        let userData = await response.json();
        console.log(userData);
        // Decrypt the profile picture and update the user display
        let profilePicture = "http://0.0.0.0:8000/" + userData.profile_picture;
        console.log(profilePicture, userData);
        updateUserDisplay(userData, profilePicture);
      } else {
        console.error("Failed to fetch user data:", response.statusText); // Error handling
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }

  function renderUser(userData, profilePicture) {
    return `
        <button class="user btn p-2 no-border">
          <div class="d-flex align-items-center gap-2">
            <!-- Profile Image -->
            <div class="users-container">
              <img src="./src/assets/home/border.png" alt="" class="users-border">
              <img src="${profilePicture}" alt="Profile Image" class="rounded-circle users">
            </div>

            <!-- User Name -->
            <div class="UserProfile">
              <p class="text-white text-decoration-none">
                <strong>${userData.nickname}</strong>
              </p>
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
  fetchUserData();
   // Function to attach event listeners when elements exist
function attachUserMenuListeners() {
  const userContainer = document.getElementById("user-container");
  const userMenu = document.getElementById("user-menu");
  console.log(userMenu, userContainer);
  if (userContainer && userMenu) {
    // Toggle dropdown visibility when clicking on the user container
    userContainer.addEventListener("click", (event) => {
      // Prevent click propagation to stop closing the menu immediately
      // event.stopPropagation();

      // Toggle visibility of the dropdown menu
      userMenu.classList.toggle("visible");

      // If the menu is now visible, we need to show it
      if (userMenu.classList.contains("visible")) {
        userMenu.classList.remove("hidden");
      }
    });

    // Close dropdown menu when clicking outside of the user container
    window.addEventListener("click", (event) => {
      if (!userMenu.contains(event.target) && !userContainer.contains(event.target)) {
        userMenu.classList.remove("visible");
        userMenu.classList.add("hidden");
      }
    });
  }

  // Delegated event listener for "View Profile" and "Log Out" clicks
  document.body.addEventListener("click", (event) => {
    if (event.target.closest("#view-profile")) {
      event.preventDefault();
      console.log("Viewing profile...");
      navigateTo("profil"); // Redirect to profile page
    }

    if (event.target.closest("#log-out")) {
      event.preventDefault();
      console.log("Logging out...");
      sessionStorage.clear(); // Clear session storage
      navigateTo("landing"); // Redirect to landing page
    }
  });
}
attachUserMenuListeners();
  // }
  /******************************************************************************** */
}