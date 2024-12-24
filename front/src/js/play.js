import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";

export function initPlayPage() {
  const modeItems = document.querySelectorAll(".mode-item");
  const confirmButton = document.getElementById("confirmButton");
  const switchCheckbox = document.getElementById("2fa-switch");

  modeItems.forEach((item) => {
    const image = item.querySelector(".mode-image");
    const description = item.querySelector(".mode-description");

    image.addEventListener("click", function handleYw() {
      eventRegistry.push({
        element: image,
        eventType: "click",
        handler: handleYw
      });
      // Hide all descriptions first
      document.querySelectorAll(".mode-description").forEach((desc) => {
        desc.classList.remove("active");
      });

      // Show clicked item's description
      description.classList.add("active");
    });
  });

  confirmButton.addEventListener("click", function handleY() {
    eventRegistry.push({
      element: confirmButton,
      eventType: "click",
      handler: handleY
    });
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
    homebtn[0].addEventListener("click", function handleA(event) {
      event.preventDefault();
      eventRegistry.push({
        element: homebtn[0],
        eventType: "click",
        handler: handleA
      });
      navigateTo("home");
    });
  }

  const homeButton = document.getElementById("home");
  if (homeButton) {
    homeButton.addEventListener("click", function handleB(event) {
      event.preventDefault();
      eventRegistry.push({
        element: homeButton,
        eventType: "click",
        handler: handleB
      });
      navigateTo("home");
    });
  }

  const leaderboardButton = document.getElementById("leaderboard");
  if (leaderboardButton) {
    leaderboardButton.addEventListener("click", function HandleC(event) {
      event.preventDefault();
      eventRegistry.push({
        element: leaderboardButton,
        eventType: "click",
        handler: HandleC
      });
      navigateTo("leaderboard");
    });
  }

  const aboutButton = document.getElementById("about");
  if (aboutButton) {
    aboutButton.addEventListener("click", function handleD(event) {
      event.preventDefault();
      eventRegistry.push({
        element: aboutButton,
        eventType: "click",
        handler: handleD
      });
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
    let token = localStorage.getItem("jwtToken");
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
        switchCheckbox.checked = userData.is_2fa_enabled;
        console.log(profilePicture, userData);
        updateUserDisplay(userData, profilePicture);
        attachUserMenuListeners();
      } else {
        console.error("Failed to fetch user data:", response.statusText); // Error handling
        localStorage.removeItem('jwtToken');
        syncSession();
        navigateTo("login");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      // localStorage.removeItem('jwtToken');
      // syncSession();
      // navigateTo("login");
    }
  }

  function renderUser(userData, profilePicture) {
    return `
        <button class="user btn p-2 no-border">
          <div class="d-flex align-items-center gap-2">
            <!-- Profile Image -->
            <div id="toggler">
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
    const userContainer = document.getElementById("toggler");
    const userMenu = document.getElementById("user-menu");
    console.log(userMenu, "WWAAAAAAWW", userContainer);
    if (userContainer && userMenu) {
      // Toggle dropdown visibility when clicking on the user container
      userContainer.addEventListener("click", function handleMed(event) {
        eventRegistry.push({
          element: userContainer,
          eventType: "click",
          handler: handleMed
        });
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
      window.addEventListener("click", function handleMeds(event) {
        eventRegistry.push({
          element: window,
          eventType: "click",
          handler: handleMeds
        });
        if (!userMenu.contains(event.target) && !userContainer.contains(event.target)) {
          userMenu.classList.remove("visible");
          userMenu.classList.add("hidden");
        }
      });
    }

    // Delegated event listener for "View Profile" and "Log Out" clicks
    document.body.addEventListener("click", async function handleSd(event) {
      eventRegistry.push({
        element: document.body,
        eventType: "click",
        handler: handleSd
      });
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
    });

document.addEventListener("change", async function handleXs(event) {
  eventRegistry.push({
    element: document,
    eventType: "change",
    handler: handleXs
  });
  if (event.target.classList.contains("input")) {
    const checkbox = event.target;
    const isChecked = checkbox.checked;
    const action = isChecked ? "enable" : "disable";

    try {
      console.log("ACXTION ; ", action);
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
});

  }
  // }
  /******************************************************************************** */
}