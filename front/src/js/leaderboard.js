import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";

export function initLeaderboardPage() {
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
        return null; // Return null if refresh fails
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
  document.querySelectorAll('img, p, a, div, button').forEach(function(element) {
    element.setAttribute('draggable', 'false');
  });
  const switchCheckbox = document.getElementById("2fa-switch");
  /*------------------------------------- NEW CODE ADDED -------------- */
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

  /*------------------------------------- NEW CODE ADDED -------------- */
  let leaderboardData = [];
  // const leaderboardData = [
  //   {
  //     id: 1,
  //     name: "Alex",
  //     level: 42,
  //     wins: 150,
  //     avatar: "https://i.pravatar.cc/160?img=1",
  //     border: "src/assets/leaderboard/rank1.png",
  //   },
  //   {
  //     id: 2,
  //     name: "Sam",
  //     level: 39,
  //     wins: 130,
  //     avatar: "https://i.pravatar.cc/160?img=2",
  //     border: "src/assets/leaderboard/rank2.png",
  //   },
  //   {
  //     id: 3,
  //     name: "Jordan",
  //     level: 38,
  //     wins: 120,
  //     avatar: "https://i.pravatar.cc/160?img=3",
  //     border: "src/assets/leaderboard/rank3.png",
  //   },
  //   {
  //     id: 4,
  //     name: "Casey",
  //     level: 35,
  //     wins: 100,
  //     avatar: "https://i.pravatar.cc/160?img=4",
  //   },
  //   {
  //     id: 5,
  //     name: "Jamie",
  //     level: 33,
  //     wins: 90,
  //     avatar: "https://i.pravatar.cc/160?img=5",
  //   },
  //   {
  //     id: 6,
  //     name: "Taylor",
  //     level: 31,
  //     wins: 80,
  //     avatar: "https://i.pravatar.cc/160?img=6",
  //   },
  //   {
  //     id: 7,
  //     name: "Morgan",
  //     level: 30,
  //     wins: 70,
  //     avatar: "https://i.pravatar.cc/160?img=7",
  //   },
  //   {
  //     id: 7,
  //     name: "Morgan",
  //     level: 30,
  //     wins: 70,
  //     avatar: "https://i.pravatar.cc/160?img=7",
  //   },
  //   {
  //     id: 7,
  //     name: "Morgan",
  //     level: 30,
  //     wins: 70,
  //     avatar: "https://i.pravatar.cc/160?img=7",
  //   },
  //   {
  //     id: 7,
  //     name: "Morgan",
  //     level: 30,
  //     wins: 70,
  //     avatar: "https://i.pravatar.cc/160?img=7",
  //   },
  //   {
  //     id: 7,
  //     name: "Morgan",
  //     level: 30,
  //     wins: 70,
  //     avatar: "https://i.pravatar.cc/160?img=7",
  //   },
  // ];

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
    return `
            <div class="podium-item podium-${place}">
                <div class="avatar-container">
                    <img src="src/assets/leaderboard/rank${place}.png" alt="" class="avatar-border">
                    <img src="http://0.0.0.0:8000${user.profile_picture}" alt="${user.nickname}" class="avatar">
                </div>
                <div class="name">${user.nickname}</div>
                <div class="podium-block">
                    <div class="podium-stats">
                        <div class="wins">${user.wins} <br><div style="color: ${color}">Win</div></div>
                        <div class="rank rank-${place}">${place}</div>
                        <div class="level">${user.level} <br><div style="color: ${color}">level</div></div>
                    </div>
                </div>
            </div>
        `;
  }

  function createLeaderboardItem(user, index) {
    const isTopThree = index < 3;
    // ${isTopThree ? 'bg-light' : ''}
    return `
            <li class="list-group-item d-flex align-items-center"> 
                <span class="fw-bold me-3 ${
                  isTopThree ? `rank rank-${index + 1}` : ""
                }" style="${isTopThree ? "font-size: 1.5rem;" : ""}">${
      index + 1
    }</span>
                <div class="line-horizontal"></div>
                <img src="http://0.0.0.0:8000${user.profile_picture}" alt="${
      user.nickname
    }" class="rounded-circle me-3" width="${
      isTopThree ? "60" : "40"
    }" height="${isTopThree ? "60" : "40"}">
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
    const leaderboardList = document.getElementById("leaderboard-list");
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
        console.log("ALL USERS : ", data);
        leaderboardData = data;
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
        localStorage.removeItem("jwtToken");
        syncSession();
        navigateTo("login");
      }

    } catch (error) {
      console.log(error);
      // localStorage.removeItem("jwtToken");
      // syncSession();
      // navigateTo("login");
    }

    // Render podium with order: 2nd, 1st, 3rd
    if (leaderboardData.length > 2) {
      const podiumHtml = `
              ${createPodiumItem(leaderboardData[1], 2)}
              ${createPodiumItem(leaderboardData[0], 1)}
              ${createPodiumItem(leaderboardData[2], 3)}
          `;
      podium.innerHTML = podiumHtml;
    }

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
    console.log("FEETCHHH", token);

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
        token = await refreshAccessToken();
  
        if (token) {
          return fetchUserData();
        } else {
          console.error("Unable to refresh access token. Please log in again.");
          localStorage.removeItem("jwtToken");
          syncSession();
          navigateTo("login");
        }
      } else {
        console.error("Failed to fetch user data:", response.statusText);
        // localStorage.removeItem("jwtToken");
        //   syncSession();
        //   navigateTo("login");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      // localStorage.removeItem("jwtToken");
      // syncSession();
      // navigateTo("login");
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
  // }
  /******************************************************************************** */
}
