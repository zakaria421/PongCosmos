// document.addEventListener("DOMContentLoaded", function () {
import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";
import { sanitizeInput, sanitizeObject } from "./main.js";


export function initHomePage() {
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
  document.querySelectorAll('img, p, a, div, button').forEach(function (element) {
    element.setAttribute('draggable', 'false');
  });

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


  console.log("BEFORE FETCHING DATA: will it be twice and why");
  // Elements
  const friendListSection = document.getElementById("friendListSection");
  const closeFriendList = document.getElementById("closeFriendList");
  const userProfile = document.getElementById("userProfile");
  const friendProfile = document.getElementById("friendProfile");

  const mobileFriendsToggle = document.getElementById("mobileFriendsToggle");

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

  let isRefreshing = false; // Flag to track if token refresh is in progress
  let refreshAttempts = 0; // Retry counter for token refresh attempts
  const maxRefreshAttempts = 100; // Maximum number of attempts to refresh token

  let userData;
  let socket = null;
  let currentRoomId = null;
  let currentFriendId = null;
  // Fetch User Data
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
        userData = sanitizeObject(toSanitize);
        const profilePicture = "https://0.0.0.0:8443/" + sanitizeInput(userData.profile_picture);
        switchCheckbox.checked = userData.is_2fa_enabled;
        updateUserDisplay(userData, profilePicture);
        attachUserMenuListeners();
        document.getElementById("prfl-pic").src = profilePicture;
        refreshAttempts = 0;
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
          console.log(refreshAttempts, "WTF why", isRefreshing);
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

      fetchFriendRequests();

      if (clickedItem && clickedItem.querySelector("#view-profile")) {
        console.log("Viewing profile...");
        navigateTo("profil");
      }

      if (clickedItem && clickedItem.querySelector("#log-out")) {
        console.log("Logging out...");
        localStorage.removeItem('jwtToken');
        localStorage.removeItem("refresh");

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



  fetchUseStatus();

  async function fetchUseStatus() {

    try {
      // await new Promise((resolve) => setTimeout(resolve, 30000));
      // const token = localStorage.getItem("jwtToken");

      let response = await fetch("https://0.0.0.0:8443/api/online-offline/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });

      if (response.ok) {
        const userData = await response.json();

        console.log("___DBG___ : Connection established", userData);
      }
      else if (response.status === 401) {
        console.log("Access token expired. Refreshing token...");

        if (refreshAttempts < maxRefreshAttempts) {

          refreshAttempts++;

          token = await refreshAccessToken();

          if (token) {
            return fetchUseStatus();
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
    }
    catch (err) {
      console.error("Error fetching user data:", err);
    }
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
    console.log("____________OPEN________DBG________");
    socket = new WebSocket(`wss://${location.host}/ws/chat/${roomId}/?receiver_id=${roomId}`);

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


  window.respondToInvite = function (inviteId, action) {
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
        navigateTo("game", { mode: "playWithFriend", id: inviteId });
      }
    } else {
      console.log("Unable to respond to game invitation. WebSocket is not connected.");
    }
  };


  function handleInviteResponse(status, senderName, inviteId) {
    if (status === "accept") {
      showNotification(`${senderName} accepted your game invitation!`);
      navigateTo("game", { mode: "playWithFriend", id: inviteId });
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
    const chatMessagesContainer = document.getElementById("chat-messages");
    if (!chatMessagesContainer) {
      console.error("Chat messages container not found!");
      return;
    }

    // Create message container
    const messageElement = document.createElement("div");
    messageElement.className = `message ${username === userData.nickname ? "sent" : "received"}`;

    // Create content container
    const contentElement = document.createElement("div");
    contentElement.className = "message-content";
    contentElement.textContent = message; // Use textContent to prevent XSS

    // Create timestamp container
    const timestampElement = document.createElement("div");
    timestampElement.className = "message-timestamp";
    timestampElement.textContent = new Date(timestamp).toLocaleTimeString();

    // Append content and timestamp to message element
    messageElement.appendChild(contentElement);
    messageElement.appendChild(timestampElement);

    // Append message element to the chat container
    chatMessagesContainer.appendChild(messageElement);

    // Scroll to the bottom of the chat
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }


  // Friend selection logic to initiate chat
  const friendItems = document.querySelectorAll(".friend-item");
  friendItems.forEach((friend) => {
    friend.addEventListener("click", () => {
      console.log(friend);
      // Update UI for the selected friend
      const friendName = friend.querySelector(".friend-name").textContent;
      const friendAvatar = friend.querySelector(".friend-avatar").src;


      document.getElementById("chatUserAvatar").src = friendAvatar;

      document.getElementById("userProfile").classList.add("d-none");
      document.getElementById("friendProfile").classList.remove("d-none");
      document.getElementById("friendProfileAvatar").src = friendAvatar;

      document.getElementById("chatUserName").textContent = friendName;

      // Show the chat window and hide the default content
      document.getElementById("defaultContent").classList.add("d-none");
      document.getElementById("chatWindow").classList.remove("d-none");

      // Update the friend profile section
      document.getElementById("friendProfileName").textContent = friendName;
      document.getElementById("friendProfileBio").textContent = friend.dataset.friendBio;
      document.getElementById("level").textContent += friend.dataset.friendLevel;

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


  addFriendButton.addEventListener("click", async function test() {
    const nickname = addFriendInput.value.trim();

    if (!nickname) {
      const errorElement = document.createElement("p");
      errorElement.style.color = "red";
      errorElement.textContent = "Please enter a nickname.";
      addFriendResult.textContent = ""; // Clear previous messages
      addFriendResult.appendChild(errorElement);
      return;
    }

    console.log("Sending friend request for nickname:", nickname);

    try {
      const response = await fetch(`https://0.0.0.0:8443/api/friends/send-friend-request/${nickname}/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const successElement = document.createElement("p");
        successElement.style.color = "green";
        successElement.textContent = result.message;
        addFriendResult.textContent = ""; // Clear previous messages
        addFriendResult.appendChild(successElement);
        addFriendInput.value = "";
        refreshAttempts = 0;
      } else if (response.status === 401) {
        console.log("Access token expired. Refreshing token...");

        if (refreshAttempts < maxRefreshAttempts) {

          refreshAttempts++;

          token = await refreshAccessToken();

          if (token) {

            return test();
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
        const error = await response.json();
        const errorElement = document.createElement("p");
        errorElement.style.color = "red";
        errorElement.textContent = error.error || "Error sending friend request.";
        addFriendResult.textContent = ""; // Clear previous messages
        addFriendResult.appendChild(errorElement);
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      const errorElement = document.createElement("p");
      errorElement.style.color = "red";
      errorElement.textContent = "An error occurred. Please try again.";
      addFriendResult.textContent = ""; // Clear previous messages
      addFriendResult.appendChild(errorElement);
    }
  });



  async function fetchFriendRequests() {
    try {
      const response = await fetch("https://0.0.0.0:8443/api/friends/friend-requests/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        refreshAttempts = 0;
        const requests = await response.json();

        // Update the badge count
        friendRequestBadge.textContent = requests.length;
        friendRequestBadge.style.display = requests.length > 0 ? "inline-block" : "none";

        // Update the friend requests container
        if (friendRequestsContainer) {
          // Clear the container
          friendRequestsContainer.textContent = "";

          requests.forEach((request) => {
            // Create the friend request container
            const requestElement = document.createElement("div");
            requestElement.className = "friend-request";

            // Create the request info section
            const infoElement = document.createElement("div");
            infoElement.className = "request-info";

            const nameElement = document.createElement("span");
            nameElement.className = "requester-name";
            nameElement.textContent = request.nickname; // Use textContent to prevent XSS
            infoElement.appendChild(nameElement);

            // Create the request actions section
            const actionsElement = document.createElement("div");
            actionsElement.className = "request-actions";

            // Create Accept button
            const acceptButton = document.createElement("button");
            acceptButton.className = "btn btn-success accept-request";
            acceptButton.dataset.nickname = request.nickname;
            acceptButton.textContent = "Accept"; // Use textContent
            actionsElement.appendChild(acceptButton);

            // Create Cancel button
            const cancelButton = document.createElement("button");
            cancelButton.className = "btn btn-danger cancel-request";
            cancelButton.dataset.nickname = request.nickname;
            cancelButton.textContent = "Cancel"; // Use textContent
            actionsElement.appendChild(cancelButton);

            // Append sections to the main request element
            requestElement.appendChild(infoElement);
            requestElement.appendChild(actionsElement);

            // Append the request element to the container
            friendRequestsContainer.appendChild(requestElement);

          });
        }

        // Reattach listeners for Accept and Cancel buttons
        attachFriendRequestListeners();
      } else if (response.status === 401) {
        console.log("Access token expired. Refreshing token...");

        if (refreshAttempts < maxRefreshAttempts) {

          refreshAttempts++;

          token = await refreshAccessToken();

          if (token) {

            return fetchFriendRequests();
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
        console.error("Failed to fetch friend requests:", response.statusText);
      }
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    }
  }

  // Event listener to open the friend requests container when clicking the button
  friendRequestButton.addEventListener("click", () => {
    friendRequestsContainer.classList.toggle("d-none");
  });

  // Function to attach event listeners for Accept and Cancel buttons
  function attachFriendRequestListeners() {
    document.querySelectorAll(".accept-request").forEach((button) => {
      button.addEventListener("click", async function tz()  {
        const nickname = button.dataset.nickname;
        try {
          const response = await fetch(`https://0.0.0.0:8443/api/friends/accept-friend-request/${nickname}/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            refreshAttempts = 0;
            const result = await response.json();
            console.log(result.message);
            button.closest(".friend-request").remove();
            fetchFriendRequests();
            fetchFriendList();
          } else if (response.status === 401) {
            console.log("Access token expired. Refreshing token...");

            if (refreshAttempts < maxRefreshAttempts) {

              refreshAttempts++;


              token = await refreshAccessToken();

              if (token) {
                return tz();
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
            console.error("Error accepting friend request:", await response.json());
          }
        } catch (err) {
          console.error("Error accepting friend request:", err);
        }
      });
    });

    document.querySelectorAll(".cancel-request").forEach((button) => {
      button.addEventListener("click", async function tesst() {
        const nickname = button.dataset.nickname;
        console.log(`Canceling friend request for: ${nickname}`); // Debug
        try {
          const response = await fetch(`https://0.0.0.0:8443/api/friends/cancel-friend-request/${nickname}/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            refreshAttempts = 0;
            const result = await response.json();
            console.log(result.message);
            button.closest(".friend-request").remove();
            fetchFriendRequests(); // Refresh badge and container
          } else if (response.status === 401) {
            console.log("Access token expired. Refreshing token...");

            if (refreshAttempts < maxRefreshAttempts) {

              refreshAttempts++;


              token = await refreshAccessToken();

              if (token) {

                return tesst();
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


  searchInput.addEventListener("input", async function tessst() {
    const query = searchInput.value.trim();

    if (query) {
      try {
        const response = await fetch(`https://0.0.0.0:8443/api/search-friends/?query=${encodeURIComponent(query)}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          refreshAttempts = 0;
          const data = await response.json();

          // Clear previous search results
          searchResults.textContent = "";

          data.results.forEach((result) => {
            // Create search result item
            const resultItem = document.createElement("div");
            resultItem.className = "search-result-item";
            resultItem.dataset.friendId = result.id;

            // Create avatar
            const avatar = document.createElement("img");
            avatar.src = result.avatar || "default-avatar.jpg";
            avatar.className = "result-avatar";
            avatar.alt = "Avatar";

            // Create info container
            const infoContainer = document.createElement("div");
            infoContainer.className = "result-info";

            // Add name
            const name = document.createElement("span");
            name.className = "result-name";
            name.textContent = result.name;
            infoContainer.appendChild(name);

            // Add bio
            const bio = document.createElement("span");
            bio.className = "result-bio";
            bio.textContent = result.bio || "No bio available";
            infoContainer.appendChild(bio);

            // Create Chat button
            const chatButton = document.createElement("button");
            chatButton.className = "btn btn-sm btn-primary chat-btn";
            chatButton.dataset.friendId = result.id;
            chatButton.dataset.friendName = result.name;
            chatButton.dataset.friendAvatar = result.avatar || "default-avatar.jpg";
            chatButton.textContent = "Chat";

            // Append elements to the result item
            resultItem.appendChild(avatar);
            resultItem.appendChild(infoContainer);
            resultItem.appendChild(chatButton);

            // Append result item to search results container
            searchResults.appendChild(resultItem);

            // Add event listener to Chat button
            chatButton.addEventListener("click", () => {
              const friendId = chatButton.dataset.friendId;
              const friendName = chatButton.dataset.friendName;
              const friendAvatar = chatButton.dataset.friendAvatar;

              console.log("Starting chat with:", friendName);

              // Disconnect existing WebSocket (if any)
              disconnectWebSocket();

              // Connect to the new WebSocket for this friend
              connectWebSocket(userData.nickname, friendId);

              // Update the chat UI
              document.getElementById("chatUserAvatar").src = friendAvatar;
              document.getElementById("chatUserName").textContent = friendName;

              // Show the chat window and hide the default content
              document.getElementById("defaultContent").classList.add("d-none");
              document.getElementById("chatWindow").classList.remove("d-none");

              // Clear previous messages (if any)
              const chatMessagesContainer = document.getElementById("chat-messages");
              chatMessagesContainer.textContent = "";
            });

            // Add event listener to result item
            resultItem.addEventListener("click", () => {
              const friendId = resultItem.dataset.friendId;
              console.log("Selected friend ID:", friendId);
              searchInput.value = ""; // Clear search input
              searchResults.textContent = ""; // Clear search results
            });
          });
        } else if (response.status === 401) {
          console.log("Access token expired. Refreshing token...");

          if (refreshAttempts < maxRefreshAttempts) {

            refreshAttempts++;

            token = await refreshAccessToken();

            if (token) {
              return tessst();
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
          console.error("Error fetching search results:", response.statusText);
        }
      } catch (err) {
        console.error("Error during search:", err);
      }
    } else {
      searchResults.textContent = "";
    }
  });




  async function fetchFriendList() {
    if (!token) {
      console.error("JWT token is missing. Please log in.");
      return;
    }
    try {
      let response = await fetch("https://0.0.0.0:8443/api/friends/friend-list/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        let data = await response.json();
        renderFriendList(data);
      } else if (response.status === 401) {
        console.log("Access token expired. Refreshing token...");

        if (refreshAttempts < maxRefreshAttempts) {

          refreshAttempts++;

          token = await refreshAccessToken();

          if (token) {
            return fetchFriendList();
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
    }
    catch (error) {
      console.error("Error fetching friends:", error);
    }
  }


  function setupInviteButton() {
    const inviteButton = document.getElementById('inviteButton');

    inviteButton.addEventListener('click', function () {
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

    // Clear the container safely
    friendListContainer.textContent = "";

    // Loop through the friends list and securely build DOM elements
    friends.forEach((friend) => {
      // Create friend item container
      const friendItem = document.createElement("div");
      friendItem.className = "friend-item";
      friendItem.dataset.friendId = friend.id;

      // Create friend avatar
      const avatar = document.createElement("img");
      avatar.src = friend.profile_picture || "default-avatar.jpg";
      avatar.className = "friend-avatar";
      avatar.alt = "Friend Avatar";

      // Create friend info container
      const infoContainer = document.createElement("div");
      infoContainer.className = "friend-info";

      // Add friend name
      const name = document.createElement("div");
      name.className = "friend-name";
      name.textContent = friend.nickname;

      // Add friend status
      const status = document.createElement("div");
      status.className = "friend-status";
      status.textContent = friend.status || "Offline";

      // Append elements to the friend info container
      infoContainer.appendChild(name);
      infoContainer.appendChild(status);

      // Append avatar and info container to the friend item
      friendItem.appendChild(avatar);
      friendItem.appendChild(infoContainer);

      // Append the friend item to the friend list container
      friendListContainer.appendChild(friendItem);

      // Add click event listener to initiate chat
      friendItem.addEventListener("click", () => {
        const friendId = friendItem.dataset.friendId;
        const friendName = name.textContent;
        const friendAvatar = avatar.src;

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
        document.getElementById("chat-messages").textContent = "";
      });

      // Add click event listener for the Block/Unblock button
      const blockBtn = document.getElementById("blockBtn");
      blockBtn.addEventListener("click", async function () {
        console.log("Friend ID to block/unblock:", friend.id);

        if (blockBtn.textContent.trim() === "Block") {
          await blockUser(friend.id);
          blockBtn.textContent = "Unblock";
          blockBtn.classList.remove("btn-danger");
          blockBtn.classList.add("btn-success");
        } else {
          await unblockUser(friend.id);
          blockBtn.textContent = "Block";
          blockBtn.classList.remove("btn-success");
          blockBtn.classList.add("btn-danger");
        }
      });

      // Add click event listener for the Game Invite button
      const invitePlayBtn = document.getElementById("invitePlayBtn");
      invitePlayBtn.addEventListener("click", async function test() {
        console.log("Friend ID to invite for game______________");
        if (!friend.id) {
          console.error("Friend ID not found!");
          showNotification("Unable to initiate game invitation.");
          return;
        }
        try{
          const currentUserResponse = await fetch(`https://${location.host}/api/profile/ingame/?user_id=${userData.id}` , {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            }
          });

          const friendResponse = await fetch(`https://${location.host}/api/profile/ingame/?user_id=${friend.id}` , {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            }
          });
          if(currentUserResponse.ok && friendResponse.ok){
            const currentUserStatus = await currentUserResponse.json();
            const friendStatus = await friendResponse.json();
            console.log("User status:", currentUserStatus.inGameStatus);
            console.log("Friend status:", friendStatus.inGameStatus);
            if(currentUserStatus.inGameStatus === false && friendStatus.inGameStatus === false){
              console.log("Game invite for Friend ID:", friend.id);
      
              const invitePayload = {
                type: "game_invite",
                sender_id: userData.id,
                sender_name: userData.nickname,
                receiver_id: parseInt(friend.id),
                invite_id: new Date().getTime(),
              };
      
              console.log("Sending game invite payload:", invitePayload);
      
              if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(invitePayload));
                showNotification("Game invitation sent!");
              } else {
                showNotification("WebSocket is not connected. Try again.");
              }
            }else{
              showNotification("One of the users is already in a game. Try again later.");
              return;
            }
          }
        }catch(error){
          console.error("Error fetching user status:", error);
        }


      });

      // Add event listener for the Modal Accept button
      const modalAcceptButton = document.querySelector("#modalAcceptButton");
      if (modalAcceptButton) {
        modalAcceptButton.addEventListener("click", () => {
          respondToInvite(inviteId, "accept");
        });
      }
    });
  }


  fetchFriendList();
  async function blockUser(friendId) {
    const blockerId = userData.id;
    try {
      const response = await fetch(`https://${location.host}/chat/block/${friendId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocker_id: blockerId }),
      });

      const result = await response.json();
      if (result.status === 'blocked') {
        console.log("User successfully blocked:", result.message);
        blockBtn.textContent = 'Unblock';
        blockBtn.classList.remove('btn-danger');
        blockBtn.classList.add('btn-success');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  async function unblockUser(friendId) {
    const blockerId = userData.id;
    try {
      const response = await fetch(`https://${location.host}/chat/unblock/${friendId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocker_id: blockerId }),
      });

      const result = await response.json();
      if (result.status === 'unblocked') {
        console.log("User successfully unblocked:", result.message);
        blockBtn.textContent = 'Block';
        blockBtn.classList.remove('btn-success');
        blockBtn.classList.add('btn-danger');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  }


  async function updateBlockButtonState(friendId) {
    try {
      const response = await fetch(`https://${location.host}/chat/status/${friendId}/`);
      const data = await response.json();

      if (data.is_blocked) {
        blockBtn.textContent = "Unblock";
        blockBtn.classList.remove("btn-danger");
        blockBtn.classList.add("btn-success");
      } else {
        blockBtn.textContent = "Block";
        blockBtn.classList.remove("btn-success");
        blockBtn.classList.add("btn-danger");
      }
    } catch (error) {
      console.error("Error updating block button:", error);
    }
  }
  const blockBtn = document.getElementById('blockBtn');
  if (blockBtn) {
    const friendId = blockBtn.dataset.friendId; // Get the friendId from the button's dataset
    if (friendId) {
      updateBlockButtonState(friendId); // Call the function with the friendId
    }
  }

  // Initial call to set up listeners in case elements are already present
  // To get the other user profil
  // Add an event listener to the entire chat-user-info container
  document.getElementById("chatUserInfo").addEventListener("click", function () {
    // Get the content of the #chatUserName
    const userName = document.getElementById("chatUserName").textContent.trim();
    navigateTo("otheruser", { name: userName })
  });
}
