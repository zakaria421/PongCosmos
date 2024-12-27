// document.addEventListener("DOMContentLoaded", function () {
  import { navigateTo } from "./main.js";
  import { eventRegistry } from "./main.js";
  import { syncSession } from "./main.js";
  
  export function initHomePage() {
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
    function renderUser(userData, profilePicture) {
      return `
          <button class="user btn p-2 no-border" draggable="false">
            <div class="d-flex align-items-center gap-2" draggable="false">
              <!-- Profile Image -->
              <div id="toggler" draggable="false">
                <div class="users-container" draggable="false">
                  <img src="./src/assets/home/border.png" alt="" class="users-border" draggable="false">
                  <img src="${profilePicture}" alt="Profile Image" class="rounded-circle users" id="profilePicture" draggable="false">
                  <p class="level text-white text-decoration-none" draggable="false">
                    <strong draggable="false">${userData.level}</strong>
                  </p>
                  </div>
  
                <!-- User Name -->
                <div class="UserProfile" draggable="false">
                  <p class="text-white text-decoration-none" draggable="false" id="profileN">
                    <strong draggable="false">${userData.nickname}</strong>
                  </p>
                </div>
              </div>
              <!-- Notification Icon -->
              <div class="Notifications" draggable="false">
                <i class="bi bi-bell-fill text-white" draggable="false"></i>
              </div>
            </div>
          </button>
      `;
    }
  
  
    function updateUserDisplay(userData, profilePicture) {
      const userProfileButtonContainer = document.getElementById("user-profile-button");
      userProfileButtonContainer.innerHTML = renderUser(userData, profilePicture);
    }
  
    console.log("BEFORE FETCHING DATA: will it be twice and why");
    // Elements
    const friendListSection = document.getElementById("friendListSection");
    const closeFriendList = document.getElementById("closeFriendList");
    // const friendItems = document.querySelectorAll(".friend-item");
    const defaultContent = document.getElementById("defaultContent");
    const chatWindow = document.getElementById("chatWindow");
    // const exitChat = document.getElementById("exitChat");
    const userProfile = document.getElementById("userProfile");
    const friendProfile = document.getElementById("friendProfile");
    // const searchBtn = document.getElementById("searchBtn");
    // const addFriendBtn = document.getElementById("addFriendBtn");
    // const searchContainer = document.querySelector(".search-container");
    // const addFriendContainer = document.querySelector(".add-friend-container");
    // const closeSearch = document.getElementById("closeSearch");
  
  
  
    const mobileFriendsToggle = document.getElementById("mobileFriendsToggle");
  
    // const closeAddFriend = document.getElementById('closeAddFriend');
    function handlerz() {
      friendListSection.classList.remove("active");
      mobileFriendsToggle.classList.remove("d-none");
    }
    closeFriendList.addEventListener("click", handlerz);
    eventRegistry.push({
      element: closeFriendList,
      eventType: "click",
      handler: handlerz
    });
  
    // Friend Selection
    // friendItems.forEach((friend) => {
    //   friend.addEventListener("click", () => {
    //     const friendName = friend.querySelector(".friend-name").textContent;
    //     const friendAvatar = friend.querySelector(".friend-avatar").src;
    //     const friendBio = friend.dataset.friendBio;
  
    //     // Update chat window
    //     document.getElementById("chatUserAvatar").src = friendAvatar;
    //     document.getElementById("chatUserName").textContent = friendName;
  
    //     // Update friend profile
    //     document.getElementById("friendProfileAvatar").src = friendAvatar;
    //     document.getElementById("friendProfileName").textContent = friendName;
    //     document.getElementById("friendProfileBio").textContent = friendBio;
  
    //     // Show chat window and friend profile
    //     defaultContent.classList.add("d-none");
    //     chatWindow.classList.remove("d-none");
    //     mobileFriendsToggle.classList.add("d-none");
    //     userProfile.classList.add("d-none");
    //     friendProfile.classList.remove("d-none");
  
    //     // Close friend list on mobile
    //     friendListSection.classList.remove("active");
    //   });
    // });
  
    // Exit Chat
    // exitChat.addEventListener("click", () => {
    //   defaultContent.classList.remove("d-none");
    //   chatWindow.classList.add("d-none");
    //   userProfile.classList.remove("d-none");
    //   friendProfile.classList.add("d-none");
    //   mobileFriendsToggle.classList.remove("d-none");
    // });
  
    // // Search and Add Friend Toggles
    // searchBtn.addEventListener("click", () => {
    //   searchContainer.classList.remove("d-none");
    //   addFriendContainer.classList.add("d-none");
    // });
  
    // addFriendBtn.addEventListener("click", () => {
    //   addFriendContainer.classList.remove("d-none");
    //   searchContainer.classList.add("d-none");
    // });
  
    // closeSearch.addEventListener("click", () => {
    //   searchContainer.classList.add("d-none");
    // });
  
    // closeAddFriend.addEventListener("click", () => {
    //   addFriendContainer.classList.add("d-none");
    // }); //*request to be sent to the backend request sent*
  
    // function handlert() {
    //   friendListSection.classList.toggle("active");
    //   mobileFriendsToggle.style.zIndex = 10;
    // }
    // mobileFriendsToggle.addEventListener("click", handlert);
    //   eventRegistry.push({
    //     element: mobileFriendsToggle,
    //     eventType: "click",
    //     handler: handlert
    //   });
  
    // Add event listener to "Play" button
    // const playButton = document.getElementById("confirmButton");
    // if (playButton) {
    //   playButton.addEventListener("click", function () {
    //     navigateTo("play");
    //   });
    // }
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
      function handlec(event) {
        event.preventDefault();
        navigateTo("leaderboard");
      };
      leaderboardButton.addEventListener("click", handlec);
      eventRegistry.push({
        element: leaderboardButton,
        eventType: "click",
        handler: handlec
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
    // }
    // Toggle the dropdown menu
    // Toggle the dropdown menu
    // Select the user button and dropdown menu
  
    /******************************************************************************** */
  
    const searchBtn = document.getElementById("searchBtn");
    const addFriendBtn = document.getElementById("addFriendBtn");
    const searchContainer = document.querySelector(".search-container");
    const addFriendContainer = document.querySelector(".add-friend-container");
    const closeSearch = document.getElementById("closeSearch");
  
    const addFriendButton = document.getElementById("addFriendButton");
    const addFriendInput = document.getElementById("addFriendInput");
    const addFriendResult = document.getElementById("addFriendResult");
  
    const friendRequestButton = document.getElementById("friendRequestButton");
    const friendRequestBadge = document.getElementById("friendRequestBadge");
    const friendRequestsContainer = document.querySelector(".friend-requests-container");
  
    const switchCheckbox = document.getElementById("2fa-switch");
  
    let userData;
    let socket = null;
    let currentRoomId = null;
    let currentFriendId = null;
    // Fetch User Data
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
          userData = await response.json();  
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
            localStorage.removeItem("jwtToken");
            syncSession();
            navigateTo("error", {message: "Unable to refresh access token. Please log in again."});
          }
        } else {
          console.error("Error fetching user data:", err);
          localStorage.removeItem("jwtToken");
          syncSession();
          navigateTo("error", {message: err.message});
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        localStorage.removeItem("jwtToken");
        syncSession();
        navigateTo("error", {message: err.message});
      }
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
  
    function connectWebSocket(username, receiverId) {
      const roomId = `${Math.min(userData.id, receiverId)}_${Math.max(userData.id, receiverId)}`;
      console.log("Connecting to room:", roomId);
    
      if (socket && currentRoomId !== roomId) {
        disconnectWebSocket();
      }
      if (currentRoomId === roomId) {
        console.log("Already connected to room:", roomId);
        return;
      }
      console.log(userData.id, receiverId)
      socket = new WebSocket(`ws://0.0.0.0:8002/ws/chat/${roomId}/?receiver_id=${roomId}`);
    
      socket.onopen = () => {
        console.log(`WebSocket connected to room: ${roomId}`);
        socket.send(JSON.stringify({ type: "join", username }));
      };
    
      socket.onmessage = (event) => {
        try {
            console.log("WebSocket message received:", event.data);
            const data = JSON.parse(event.data);
            console.log("________TYPE____DBG______", data.type);
            console.log("________INVITEID____DBG______", data.invite_id);
            if (data.type === "game_invite" && data.sender_id !== userData.id) {
                console.log("Game invitation received", data);
                showGameInviteModal(data.sender_name, data.invite_id);
            } else if (data.type === "invite_response" && data.sender_id !== userData.id) {
                console.log("Invite response received");
                console.log("________SENDERNAME____DBG______", data.sender_name);
                handleInviteResponse(data.status, data.sender_name, data.invite_id);
            } else if (data.message) {
                appendMessageToChat(data.username, data.message, data.timestamp);
            } else {
                console.log("Unknown WebSocket data:", data);
            }
        }
        catch (error) {
            console.error("Error processing WebSocket message:", error);
        }
    };
    
    
      socket.onclose = () => {
        console.log("WebSocket disconnected.");
        currentRoomId = null;
      };
    
      socket.onerror = (error) => console.error("WebSocket error:", error);
    }
    function showGameInviteModal(senderName, inviteId) {
      const modalHTML = `
            <div class="modal fade show" id="gameInviteModal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5)">
                <div class="modal-dialog">
                    <div class="modal-content" style="background-color: #452c63; color: white; border: 1px solid #720e9e;">
                        <div class="modal-header" style="border-bottom: 1px solid #720e9e;">
                            <h5 class="modal-title">Game Invitation</h5>
                        </div>
                        <div class="modal-body">
                            <p>${senderName} has invited you to play a game!</p>
                        </div>
                        <div class="modal-footer" style="border-top: 1px solid #720e9e;">
                            <button class="btn btn-outline-secondary" onclick="respondToInvite(${inviteId}, 'decline')">
                                Decline
                            </button>
                            <button class="btn btn-primary" style="background-color: #DDA0DD; border: 1px solid #4B0082;" onclick="respondToInvite(${inviteId}, 'accept')">
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          `;
    
      // Remove existing modals and add new modal
      const existingModal = document.getElementById("gameInviteModal");
      if (existingModal) existingModal.remove();
    
      document.body.insertAdjacentHTML("beforeend", modalHTML);
    }
    
    
    window.respondToInvite = function(inviteId, action) {
      const responsePayload = {
          type: "invite_response",
          invite_id: inviteId,
          status: action,
          sender_id: userData.id,
          sender_name: userData.nickname,
      };
    
      if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(responsePayload));
          document.getElementById("gameInviteModal").remove();
          if (action === "accept") {
              console.log("Game invitation accepted. Redirecting to game...");
              navigateTo("game", {mode: "playWithFriend", id: inviteId});
          }
      } else {
          console.log("Unable to respond to game invitation. WebSocket is not connected.");
      }
    };
    
    
    function handleInviteResponse(status, senderName, inviteId) {
        if (status === "accept") {
            showNotification(`${senderName} accepted your game invitation!`);
            navigateTo("game", {mode: "playWithFriend", id: inviteId});
          } else if (status === "declined") {
            showNotification(`${senderName} declined your game invitation.`);
        }
    }
    
    function showNotification(message) {
      console.log("_________GAME INVT ACCEPTED______DBG____!");
      const notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #800080;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        `;
        notification.textContent = message;
    
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    
        // Add to document and remove after delay
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
  
    function disconnectWebSocket() {
      if (socket) {
        console.log("Disconnecting WebSocket...");
        socket.close();
        socket = null;
        currentRoomId = null;
      }
    }
  
    // Function to send messages to the server via WebSocket
    function sendMessage(message) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const payload = {
          type: "message",
          message: message,
          username: userData.nickname,
          timestamp: new Date().toISOString(),
        };
  
        console.log("Sending payload:", payload);
        socket.send(JSON.stringify(payload));
      } else {
        console.error("WebSocket connection is not open.");
      }
    }
  
  
    function appendMessageToChat(username, message, timestamp) {
      // console.log("appendMessageToChat called:", { username, message, timestamp });
  
      const chatMessagesContainer = document.getElementById("chat-messages");
      if (!chatMessagesContainer) {
        console.error("Chat messages container not found!");
        return;
      }
  
      const messageElement = document.createElement("div");
      messageElement.className = `message ${username === userData.nickname ? "sent" : "received"}`;
      messageElement.innerHTML = `
          <div class="message-content">${message}</div>
          <div class="message-timestamp">${new Date(timestamp).toLocaleTimeString()}</div>
      `;
      chatMessagesContainer.appendChild(messageElement);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  
      // console.log("Message appended to chat:", messageElement);
    }
  
    // Friend selection logic to initiate chat
    const friendItems = document.querySelectorAll(".friend-item");
    friendItems.forEach((friend) => {
      friend.addEventListener("click", () => {
        // Update UI for the selected friend
        const friendName = friend.querySelector(".friend-name").textContent;
        const friendAvatar = friend.querySelector(".friend-avatar").src;
  
  
        document.getElementById("chatUserAvatar").src = friendAvatar;
        document.getElementById("chatUserName").textContent = friendName;
  
        // Show the chat window and hide the default content
        document.getElementById("defaultContent").classList.add("d-none");
        document.getElementById("chatWindow").classList.remove("d-none");
  
        // Update the friend profile section
        document.getElementById("friendProfileName").textContent = friendName;
        document.getElementById("friendProfileBio").textContent = friend.dataset.friendBio;
  
        // Show chat window and friend profile
        mobileFriendsToggle.classList.add("d-none");
        userProfile.classList.add("d-none");
        friendProfile.classList.remove("d-none");
  
        // Close friend list on mobile
        friendListSection.classList.remove("active");
      });
    });
  
    // Handle sending a message when the user clicks the send button
    const sendButton = document.querySelector(".chat-input button");
    const chatInput = document.querySelector(".chat-input input");
  
    sendButton.addEventListener("click", () => {
      const message = chatInput.value.trim();
      if (message) {
        sendMessage(message);
        // appendMessageToChat(userData.nickname, message, new Date().toISOString());
        chatInput.value = "";
      }
    });
  
    chatInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        const message = chatInput.value.trim();
        console.log("waaaaaaal3adaw ", message);
        if (message !== "") {
          sendMessage(message);
          chatInput.value = "";
        }
      }
    });
  
  
    // Exit Chat
    const exitChat = document.getElementById("exitChat");
    exitChat.addEventListener("click", () => {
      document.getElementById("defaultContent").classList.remove("d-none");
      document.getElementById("chatWindow").classList.add("d-none");
      document.getElementById("userProfile").classList.remove("d-none");
      document.getElementById("friendProfile").classList.add("d-none");
      mobileFriendsToggle.classList.remove("d-none");
    });
  
  
    mobileFriendsToggle.addEventListener("click", () => {
      friendListSection.classList.toggle("active");
      mobileFriendsToggle.classList.add("d-none");
    });
  
    // Add event listener to "Play" button
    const playButton = document.getElementById("confirmButton");
    if (playButton) {
      playButton.addEventListener("click", function () {
        navigateTo("play"); // Redirect to 'login' page when Play button is clicked
      });
    }
    fetchUserData();
  
    // Search and Add Friend Toggles
    searchBtn.addEventListener("click", () => {
      searchContainer.classList.remove("d-none");
      addFriendContainer.classList.add("d-none");
    });
  
    addFriendBtn.addEventListener("click", () => {
      addFriendContainer.classList.remove("d-none");
      searchContainer.classList.add("d-none");
    });
  
    closeSearch.addEventListener("click", () => {
      searchContainer.classList.add("d-none");
      if (socket) {
        socket.close();
      }
      connectWebSocket(userData.nickname, friendId);
    });
  
  
    addFriendButton.addEventListener("click", () => {
      addFriendContainer.classList.remove("d-none");
      searchContainer.classList.add("d-none");
    });
  
  
    addFriendButton.addEventListener("click", async () => {
      const nickname = addFriendInput.value.trim();
  
      if (!nickname) {
        addFriendResult.innerHTML = "<p style='color: red;'>Please enter a nickname.</p>";
        return;
      }
  
      console.log("Sending friend request for nickname:", nickname);
  
      try {
        const response = await fetch(`http://0.0.0.0:8000/friends/send-friend-request/${nickname}/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
            "Content-Type": "application/json",
          },
        });
  
        if (response.ok) {
          const result = await response.json();
          addFriendResult.innerHTML = `<p style='color: green;'>${result.message}</p>`;
          addFriendInput.value = "";
        } else {
          const error = await response.json();
          addFriendResult.innerHTML = `<p style='color: red;'>${error.error || "Error sending friend request."}</p>`;
        }
      } catch (err) {
        console.error("Error sending friend request:", err);
        addFriendResult.innerHTML = "<p style='color: red;'>An error occurred. Please try again.</p>";
      }
    });
  
  
  
    async function fetchFriendRequests() {
      try {
        const response = await fetch("http://0.0.0.0:8000/friends/friend-requests/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            "Content-Type": "application/json",
          },
        });
  
        if (response.ok) {
          const requests = await response.json();
  
          // uuuuupdate the badge count
          friendRequestBadge.textContent = requests.length;
          friendRequestBadge.style.display = requests.length > 0 ? "inline-block" : "none";
  
          // uuupdate the friend requests continer
          if (friendRequestsContainer) {
            friendRequestsContainer.innerHTML = "";
            requests.forEach((request) => {
              friendRequestsContainer.innerHTML += `
              <div class="friend-request">
                <div class="request-info">
                  <span class="requester-name">${request.nickname}</span>
                </div>
                <div class="request-actions">
                  <button class="btn btn-success accept-request" data-nickname="${request.nickname}">Accept</button>
                  <button class="btn btn-danger cancel-request" data-nickname="${request.nickname}">Cancel</button>
                </div>
              </div>
            `;
            });
          }
  
          // Reattach listeners for Accept and Cancel buttons
          attachFriendRequestListeners();
        } else {
          console.error("Failed to fetch friend requests:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching friend requests:", err);
        // localStorage.removeItem('jwtToken');
        // syncSession();
      }
    }
  
    // Event listener to open the friend requests container when clicking the button
    friendRequestButton.addEventListener("click", () => {
      friendRequestsContainer.classList.toggle("d-none");
    });
  
    // Function to attach event listeners for Accept and Cancel buttons
    function attachFriendRequestListeners() {
      document.querySelectorAll(".accept-request").forEach((button) => {
        button.addEventListener("click", async () => {
          const nickname = button.dataset.nickname;
          try {
            const response = await fetch(`http://0.0.0.0:8000/friends/accept-friend-request/${nickname}/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                "Content-Type": "application/json",
              },
            });
  
            if (response.ok) {
              const result = await response.json();
              console.log(result.message);
              button.closest(".friend-request").remove();
              fetchFriendRequests(); // Refresh badge and container
            } else {
              console.error("Error accepting friend request:", await response.json());
            }
          } catch (err) {
            console.error("Error accepting friend request:", err);
          }
        });
      });
  
      document.querySelectorAll(".cancel-request").forEach((button) => {
        button.addEventListener("click", async () => {
          const nickname = button.dataset.nickname;
          console.log(`Canceling friend request for: ${nickname}`); // Debug
          try {
            const response = await fetch(`http://0.0.0.0:8000/friends/cancel-friend-request/${nickname}/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                "Content-Type": "application/json",
              },
            });
  
            if (response.ok) {
              const result = await response.json();
              console.log(result.message);
              button.closest(".friend-request").remove();
              fetchFriendRequests(); // Refresh badge and container
            } else {
              console.error("Error canceling friend request:", await response.json());
            }
          } catch (err) {
            console.error("Error canceling friend request:", err);
          }
        });
      });
    }
    fetchFriendRequests();
  
  
  
    let searchResults = document.querySelector(".search-results");
  
    if (!searchResults) {
      searchResults = document.createElement("div");
      searchResults.classList.add("search-results");
      searchContainer.appendChild(searchResults);
    }
  
    searchInput.addEventListener("input", async () => {
      const query = searchInput.value.trim();
  
      if (query) {
        try {
          const response = await fetch(`http://0.0.0.0:8000/api/search-friends/?query=${query}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
              "Content-Type": "application/json",
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            searchResults.innerHTML = data.results
              .map(
                (result) => `
                          <div class="search-result-item" data-friend-id="${result.id}">
                            <img src="${result.avatar || 'default-avatar.jpg'}" class="result-avatar" alt="Avatar" />
                            <div class="result-info">
                                <span class="result-name">${result.name}</span>
                                <span class="result-bio">${result.bio || "No bio available"}</span>
                            </div>
                            <button class="btn btn-sm btn-primary chat-btn" data-friend-id="${result.id}" data-friend-name="${result.name}" data-friend-avatar="${result.avatar}">Chat</button>
                          </div>`
              )
              .join("");
            // Add click listeners to each Chat button
            document.querySelectorAll(".chat-btn").forEach((button) => {
              button.addEventListener("click", () => {
                const friendId = button.dataset.friendId;
                const friendName = button.dataset.friendName;
                const friendAvatar = button.dataset.friendAvatar;
  
                console.log("Starting chat with:", friendName);
  
                // Disconnect existing WebSocket (if any)
                disconnectWebSocket();
  
                // Connect to the new WebSocket for this friend
                connectWebSocket(userData.nickname, friendId);
  
                // Update the chat UI
                document.getElementById("chatUserAvatar").src = friendAvatar || "default-avatar.jpg";
                document.getElementById("chatUserName").textContent = friendName;
  
                // Show the chat window and hide the default content
                document.getElementById("defaultContent").classList.add("d-none");
                document.getElementById("chatWindow").classList.remove("d-none");
  
                // Clear previous messages (if any)
                const chatMessagesContainer = document.getElementById("chat-messages");
                chatMessagesContainer.innerHTML = "";
              });
            });
  
            document.querySelectorAll(".search-result-item").forEach((item) => {
              item.addEventListener("click", () => {
                const friendId = item.dataset.friendId;
                console.log("Selected friend ID:", friendId);
                searchInput.value = ""; // Clear search input
                searchResults.innerHTML = ""; // Clear search results
              });
            });
          } else {
            console.error("Error fetching search results:", response.statusText);
          }
        } catch (err) {
          console.error("Error during search:", err);
        }
      } else {
        searchResults.innerHTML = "";
      }
    });
  
    function fetchFriendList() {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        console.error("JWT token is missing. Please log in.");
        return;
      }
      fetch("http://0.0.0.0:8000/friends/friend-list/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch friend list");
          return response.json();
        })
        .then(renderFriendList)
        .catch((error) => console.error("Error fetching friends:", error));
    }
  
  
    function setupInviteButton() {
      const inviteButton = document.getElementById('inviteButton');
    
      inviteButton.addEventListener('click', function() {
        const friendId = inviteButton.getAttribute('data-friend-id');
        sendGameInvite(friendId);
        inviteButton.disabled = true;
        inviteButton.style.backgroundColor = 'green';
      });
    }
    function renderFriendList(friends) {
      const friendListContainer = document.querySelector(".friend-list");
      if (!friendListContainer) {
        console.error("Friend list container not found!");
        return;
      }
  
      friendListContainer.innerHTML = friends
        .map(
          (friend) => `
            <div class="friend-item" data-friend-id="${friend.id}">
              <img src="${friend.profile_picture || 'default-avatar.jpg'}" class="friend-avatar" />
              <div class="friend-info">
                <div class="friend-name">${friend.nickname}</div>
                <div class="friend-status">${friend.status || "Offline"}</div>
              </div>
            </div>`
        )
        .join("");
  
      // Attach click event listeners to friend items
      document.querySelectorAll(".friend-item").forEach((friendItem) => {
        friendItem.addEventListener("click", () => {
          const friendId = friendItem.dataset.friendId;
          const friendName = friendItem.querySelector(".friend-name").textContent;
          const friendAvatar = friendItem.querySelector(".friend-avatar").src;
  
          console.log(`Starting chat with: ${friendName}`);
  
          // Disconnect any existing WebSocket and initiate a new one
          disconnectWebSocket();
          connectWebSocket(userData.nickname, friendId);
          
          friendListSection.classList.remove("active");
          // Update the chat window UI
          document.getElementById("chatUserAvatar").src = friendAvatar;
          document.getElementById("chatUserName").textContent = friendName;
          
          // Show chat window
          document.getElementById("defaultContent").classList.add("d-none");
          document.getElementById("chatWindow").classList.remove("d-none");
  
          // Clear previous messages
          document.getElementById("chat-messages").innerHTML = "";
        });
  
        const friendId = friendItem.dataset.friendId;
  
        blockBtn.addEventListener('click', async function() {
          console.log("Friend ID to block/unblock:", friendId);
    
          if (blockBtn.textContent.trim() === 'Block') {
            await blockUser(friendId);
            blockBtn.textContent = 'Unblock';
            blockBtn.classList.remove('btn-danger'); 
            blockBtn.classList.add('btn-success');
          } else {
            await unblockUser(friendId);
            blockBtn.textContent = 'Block';
            blockBtn.classList.remove('btn-success');
            blockBtn.classList.add('btn-danger');
          }
        });
  
  
        const invitePlayBtn = document.getElementById("invitePlayBtn");
  
        invitePlayBtn.addEventListener("click", () => {
            // const friendId = document.getElementById("blockBtn").dataset.friendId;
            if (!friendId) {
                console.error("Friend ID not found!");
                showNotification("Unable to initiate game invitation.");
                return;
            }
  
            console.log("Game invite for Friend ID:", friendId);
            
            const invitePayload = {
              type: "game_invite",
              sender_id: userData.id,
              sender_name: userData.nickname,
              receiver_id: parseInt(friendId),
              invite_id: new Date().getTime(),
            };
            
            console.log("Sending game invite payload:", invitePayload);
  
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(invitePayload));
                showNotification("Game invitation sent!");
            } else {
                showNotification("WebSocket is not connected. Try again.");
            }
        });
  
        const modalAcceptButton = document.querySelector('#modalAcceptButton');
        if (modalAcceptButton) {
            modalAcceptButton.addEventListener('click', function() {
                respondToInvite(inviteId, 'accept');
            });
        }
      });
    }
  
    fetchFriendList();
    async function blockUser(friendId) {
      const blockerId = userData.id;
      console.log("Blocker ID:", blockerId);
      console.log("Friend ID:", friendId);
    
      try {
        const response = await fetch(`http://0.0.0.0:8002/chat/block/${friendId}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocker_id: blockerId }),
        });
    
        const result = await response.json();
        console.log("User Blocked:", result.message);
      } catch (error) {
        console.error('Error blocking user:', error);
      }
    }
    
    async function unblockUser(friendId) {
      const blockerId = userData.id;
    
      console.log("Unblock Function Triggered! Blocker ID:", blockerId, "Friend ID:", friendId);
    
      try {
        const response = await fetch(`http://0.0.0.0:8002/chat/unblock/${friendId}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocker_id: blockerId }),
        });
    
        const result = await response.json();
        console.log("Unblock API Response:", result);
    
        if (result.status === 'unblocked') {
          console.log("User successfully unblocked!");
          blockBtn.textContent = 'Block';
          blockBtn.classList.remove('btn-success');
          blockBtn.classList.add('btn-danger');
        }
    
      } catch (error) {
        console.error('Error unblocking user:', error);
      }
    }
  
  
    //  async function updateBlockButtonState(friendId) {
      //   try {
      //     const response = await fetch(`http://0.0.0.0:8002/chat/status/${friendId}/`);
      //     const data = await response.json();
      
      //     if (data.is_blocked) {
      //       blockBtn.textContent = "Unblock";
      //       blockBtn.classList.remove("btn-danger");
      //       blockBtn.classList.add("btn-success");
      //     } else {
      //       blockBtn.textContent = "Block";
      //       blockBtn.classList.remove("btn-success");
      //       blockBtn.classList.add("btn-danger");
      //     }
      //   } catch (error) {
      //     console.error("Error updating block button:", error);
      //   }
      // }
      // const blockBtn = document.getElementById('blockBtn');
  //   if (blockBtn) {
  //     const friendId = blockBtn.dataset.friendId; // Get the friendId from the button's dataset
  //     if (friendId) {
  //       updateBlockButtonState(friendId); // Call the function with the friendId
  //     }
  //   }
  
    // Initial call to set up listeners in case elements are already present
    // To get the other user profil
    // Add an event listener to the entire chat-user-info container
    document.getElementById("chatUserInfo").addEventListener("click", function () {
      // Get the content of the #chatUserName
      const userName = document.getElementById("chatUserName").textContent.trim();
      navigateTo("otheruser", { name: userName })
    });
  }
  