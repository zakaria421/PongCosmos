import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";

export function initProfilPage() {
  document.querySelectorAll('img, p, a').forEach(function(element) {
    element.setAttribute('draggable', 'false');
  });
  let token = localStorage.getItem("jwtToken");
  const switchCheckbox = document.getElementById("2fa-switch");
  let isEditing = false;

  const friendsContainer = document.getElementById("friendsContainer");

  // Mock friends data
  // const friends = [
  //   {
  //     name: "Alice",
  //     status: "online",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "Bob",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "Charlie",
  //     status: "online",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "David",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "Eve",
  //     status: "online",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "Frank",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "54y6",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "y",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "4",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "y",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "h",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "b",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "w",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "p",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  //   {
  //     name: "c",
  //     status: "offline",
  //     picture: "https://i.pravatar.cc/160?img=3",
  //   },
  // ];


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
              <img src="${friend.picture}" alt="${
        friend.name
      }" class="friend-picture">
              <div>
                  <p class="friend-name">${friend.name}</p>
                  <span class="friend-status ${friend.status}">
                      <span class="status-indicator"></span>
                      ${
                        friend.status.charAt(0).toUpperCase() +
                        friend.status.slice(1)
                      }
                  </span>
              </div>
          `;
      friendsContainer.appendChild(div);
    });
  }

  // Match History (last 10 games)

  const matchData = [
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 10,
      },
      enemy: {
        name: "Enemy1",
        icon: "https://picsum.photos/50?random=2",
        score: 8,
      },
    },
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 7,
      },
      enemy: {
        name: "Enemy2",
        icon: "https://picsum.photos/50?random=3",
        score: 9,
      },
    },
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 12,
      },
      enemy: {
        name: "Enemy3",
        icon: "https://picsum.photos/50?random=4",
        score: 6,
      },
    },
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 8,
      },
      enemy: {
        name: "Enemy4",
        icon: "https://picsum.photos/50?random=5",
        score: 8,
      },
    },
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 15,
      },
      enemy: {
        name: "Enemy5",
        icon: "https://picsum.photos/50?random=6",
        score: 13,
      },
    },
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 9,
      },
      enemy: {
        name: "Enemy6",
        icon: "https://picsum.photos/50?random=7",
        score: 11,
      },
    },
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 14,
      },
      enemy: {
        name: "Enemy7",
        icon: "https://picsum.photos/50?random=8",
        score: 10,
      },
    },
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 6,
      },
      enemy: {
        name: "Enemy8",
        icon: "https://picsum.photos/50?random=9",
        score: 7,
      },
    },
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 11,
      },
      enemy: {
        name: "Enemy9",
        icon: "https://picsum.photos/50?random=10",
        score: 9,
      },
    },
    {
      player: {
        name: "Player1",
        icon: "https://picsum.photos/50?random=1",
        score: 13,
      },
      enemy: {
        name: "Enemy10",
        icon: "https://picsum.photos/50?random=11",
        score: 12,
      },
    },
  ];

  function createMatchCard(match) {
    const playerWon = match.player.score > match.enemy.score;
    const card = document.createElement("div");
    card.className = "match-card";
    card.innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-12 col-sm-5 d-flex flex-column flex-sm-row align-items-center justify-content-start mb-3 mb-sm-0">
                        <img src="${
                          match.player.icon
                        }" alt="" class="player-icon mb-2 mb-sm-0 me-sm-2">
                        <h5 class="player-name ${
                          playerWon ? "winner" : "loser"
                        }">${match.player.name}</h5>
                    </div>
                    <div class="col-12 col-sm-2 text-center mb-3 mb-sm-0">
                        <div class="score">${match.player.score} - ${
      match.enemy.score
    }</div>
                    </div>
                    <div class="col-12 col-sm-5 d-flex flex-column flex-sm-row align-items-center justify-content-end">
                        <h5 class="enemy-name ${
                          playerWon ? "loser" : "winner"
                        } mb-2 mb-sm-0 me-sm-2">${match.enemy.name}</h5>
                        <img src="${
                          match.enemy.icon
                        }" alt="" class="enemy-icon">
                    </div>
                </div>
            </div>
        `;
    return card;
  }

  function displayMatchHistory() {
    const matchHistoryContainer = document.getElementById("matchHistory");
    matchHistoryContainer.innerHTML = "";

    // Get the last 10 games from matchData
    const recentMatches = matchData.slice(-10);

    recentMatches.forEach((match) => {
      const matchCard = createMatchCard(match);
      matchHistoryContainer.appendChild(matchCard);
    });
  }

  displayMatchHistory();
  /**
   * ------------------------------------------------------------------
   */
  async function fetchUserData() {
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
        console.log(profilePicture);
        updateUserDisplay(userData, profilePicture);
        document.getElementById("profileName").textContent = userData.nickname;
        document.getElementById("profileBio").textContent = userData.bio;
        document.getElementById("profileImage").src = profilePicture;
        renderFriends(userData.friends);
        attachUserMenuListeners();
      } else {
        console.error("Failed to fetch user data:", response.statusText);
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
              <img src="${profilePicture}" alt="Profile Image" class="rounded-circle users" id="profilePicture">
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

  console.log("displayed twice for some reason: ");
  fetchUserData();
  // Edit profile logic
  function handlehg() {
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
      } else {
        const updatedName = document.getElementById("profileName").textContent;
        const updatedBio = document.getElementById("profileBio").textContent;

        fetch("http://0.0.0.0:8000/profile/update/", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nickname: updatedName, bio: updatedBio }),
        })
          .then((response) => response.json())
          .then((userData) => {
            document.getElementById("profileName").textContent = userData.nickname;
            fetchUserData();
            console.log("Profile updated successfully:", userData);
          })
          .catch((error) => console.error("Error updating profile:", error));

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

  // Image upload logic
  document
    .getElementById("profileImage")
    .addEventListener("click", function handlepl() {
      eventRegistry.push({
        element: document.getElementById("profileImage"),
        eventType: "click",
        handler: handlepl
      });
      console.log("Image clicked");
      if (isEditing) {
        document.getElementById("fileInput").click();
      }
    });

  document
    .getElementById("fileInput")
    .addEventListener("change", function handlepls(event) {
      event.preventDefault();
      eventRegistry.push({
        element: document.getElementById("fileInput"),
        eventType: "change",
        handler: handlepls
      });
      console.log("File input changed");
      let formData = new FormData();
      const file = event.target.files[0];

      if (file) {
        formData.append("profile_picture", file);
        fetch("http://0.0.0.0:8000/profile/update/picture/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((userData) => {
            const imageUrl = "http://0.0.0.0:8000/" + userData.profile_picture;
            document.getElementById("profilePicture").src = imageUrl;
            document.getElementById("profileImage").src = imageUrl;
          })
          .catch((error) => console.error("Error uploading image:", error));
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
