const contentDiv = document.getElementById('app');
const validPages = ['landing', 'login', 'home', 'about', 'leaderboard', 'play', 'profil', 'game', 'otheruser', 'error'];
export const eventRegistry = [];





// let socket = null;

// statusCheck()
let isRefreshing = false; // Flag to track if token refresh is in progress
let refreshAttempts = 0; // Retry counter for token refresh attempts
const maxRefreshAttempts = 100;
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

// async function statusCheck(){
//   try {
//     await new Promise((resolve) => setTimeout(resolve, 3000));

//     const token = localStorage.getItem("jwtToken");
//     let response = await fetch("https://0.0.0.0:8443/api/userinfo/", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       method: "GET",
//     });

//     if (response.ok) {
//       const userData = await response.json();

//       socket = new WebSocket(`wss://${location.host}/ws/status/?online_id=${userData.id}`);
//       socket.onopen = async function (event) {
//         socket.send(JSON.stringify({ type: "onlineCheck" }));
//       }
      
//       socket.onmessage = function (event) {
//         const data = JSON.parse(event.data);
//         console.log("___DATA___DBG___ : ", data);
//         if (data.type === "onlineCheckResponse") {
//           console.log("___DBG___ : Online check response received");
//           console.log("User ID:", data.online_id, "Status:", data.status);
//           // Handle the onlineCheckResponse message here
//         } else if (data.type === "user.status") {
//           console.log("___DBG___ : User status update received");
//           console.log("User ID:", data.user_id, "Status:", data.status);
//           // if (data.status == 'online') {
//           //   console.log("___FREIND____STATUS_____DBG___ :", friend.status);
//           // }
//           // else if (data.status == 'offline') {

//           // }
//         } 
//         else {
//           console.log("___DBG___ : Unhandled message type:", data.type);
//         }
//       };
//     } else if (response.status === 401) {
//       console.log("Access token expired. Refreshing token...");

//       if (refreshAttempts < maxRefreshAttempts) {

//         refreshAttempts++;

//         token = await refreshAccessToken();

//         if (token) {
//           return statusCheck();
//         } else {
//           localStorage.removeItem("jwtToken");
//       localStorage.removeItem("refresh");

//           syncSession();
//           navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
//         }
//       } else {
//         console.error("Failed to refresh token after multiple attempts.");
//         localStorage.removeItem("jwtToken");
//       localStorage.removeItem("refresh");

//         syncSession();
//         navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
//       }
//     }
//   } catch (err) {
//     console.error("Error fetching user data:", err);
//   }
// }




// export async function disconnectSocket() {
//   console.log('___DISCONNECT___SOCKET___CALLED___');
//   if (socket) {
//     socket.send(JSON.stringify({ type: "set_offline" }));
//     socket.close();
//     console.log("WebSocket disconnected.");
//     socket = null; // Ensure the socket variable is cleared
//   } else {
//     console.log("No active WebSocket connection to disconnect.");
//   }
// }














const ss = { socket: null };

export default ss;

let userData = null;

statusCheck();

async function statusCheck() {
  try {
    const token = localStorage.getItem("jwtToken");

    let response = await fetch("https://0.0.0.0:8443/api/userinfo/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    if (response.ok) {
      userData = await response.json();
      console.log("___DBG___ : User data fetched successfully:", userData);

      await markUserOnline(token);

      setupWebSocket(userData.id);
    }else if (response.status === 401) {
      console.log("Access token expired. Refreshing token...");

      if (refreshAttempts < maxRefreshAttempts) {

        refreshAttempts++;

        token = await refreshAccessToken();

        if (token) {
          return statusCheck();
        } else {
          localStorage.removeItem("jwtToken");
      localStorage.removeItem("refresh");

          syncSession();
          navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
        }
      }
    }

  } catch (err) {
    console.error("Error fetching user data:", err);
  }
}

async function markUserOnline(token) {
  try {
    let response = await fetch("https://0.0.0.0:8443/api/online-offline/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (response.ok) {
      console.log("___DBG___ : User marked as online.");
    } else if (response.status === 401) {
      console.log("Access token expired. Refreshing token...");

      if (refreshAttempts < maxRefreshAttempts) {

        refreshAttempts++;

        token = await refreshAccessToken();

        if (token) {
          return markUserOnline();
        } else {
          localStorage.removeItem("jwtToken");
      localStorage.removeItem("refresh");

          syncSession();
          navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
        }
      }
    }
  } catch (err) {
    console.error("Error marking user online:", err);
  }
}

async function markUserOffline() {
  try {
    const token = localStorage.getItem("jwtToken");
    let response = await fetch("https://0.0.0.0:8443/api/online-offline/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "DELETE",
    });

    if (response.ok) {
      console.log("___DBG___ : User marked as offline.");
    } else if (response.status === 401) {
      console.log("Access token expired. Refreshing token...");

      if (refreshAttempts < maxRefreshAttempts) {

        refreshAttempts++;

        token = await refreshAccessToken();

        if (token) {
          return markUserOffline();
        } else {
          localStorage.removeItem("jwtToken");
      localStorage.removeItem("refresh");

          syncSession();
          navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
        }
      }
    }
  } catch (err) {
    console.error("Error marking user offline:", err);
  }
}

function setupWebSocket(userId) {
  ss.socket = new WebSocket(`wss://${location.host}/ws/status/?online_id=${userId}`);

  ss.socket.onopen = function () {
    console.log("WebSocket connection opened.");
    ss.socket.send(JSON.stringify({ type: "onlineCheck" }));
  };

  ss.socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log("___DATA___DBG___ : ", data);

    if (data.type === "onlineCheckResponse") {
      console.log("___DBG___ : Online check response received");
      console.log("User ID:", data.online_id, "Status:", data.status);
    } else if (data.type === "user.status") {
        console.log("___DBG___ : User status update received");
        console.log("User ID:", data.user_id, "Status:", data.status);
        if (data.status == 'online') {
            console.log("_____________________User is online_________________");
            updateFriendStatus(data.user_id, 'online');
        } else if (data.status == 'offline') {
            updateFriendStatus(data.user_id, 'offline');
        }
    }
  };
}

function updateFriendStatus(userId, status) {
  const friendItem = document.querySelector(`.friend-item[data-friend-id="${userId}"]`);
  if (friendItem) {
    const statusElement = friendItem.querySelector('.friend-status');
    console.log("_____________CHECK_________STATUS__________", statusElement);
    if (statusElement) {
      statusElement.textContent = status;
      console.log(`Status updated fooooor user ${userId}: ${status}`);
    }
  } else {
    console.log("Friend not found");
  }
}


export async function getOnlineUsers() {
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch("https://0.0.0.0:8443/api/online-offline/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("___DBG___ : Online users fetched successfully:", data.online_users);
      updateOnlineUsersUI(data.online_users);
    }else if (response.status === 401) {
      console.log("Access token expired. Refreshing token...");

      if (refreshAttempts < maxRefreshAttempts) {

        refreshAttempts++;

        token = await refreshAccessToken();

        if (token) {
          return getOnlineUsers();
        } else {
          localStorage.removeItem("jwtToken");
      localStorage.removeItem("refresh");

          syncSession();
          navigateTo("error", { message: "Unable to refresh access token. Please log in again." });
        }
      }
    }
  } catch (err) {
    console.error("Error fetching online users:", err);
  }
}

function updateOnlineUsersUI(onlineUsers) {
  const friendItems = document.querySelectorAll(".friend-item");
  console.log("_____________________FRIEND ID_________________ :", friendItems);
  friendItems.forEach((item) => {
    const friendId = item.getAttribute("data-friend-id");

    if (onlineUsers.includes(parseInt(friendId))) {
      const statusElement = item.querySelector(".friend-status");
      if (statusElement) {
        statusElement.textContent = "online";
        console.log(`User ${friendId} is online.`);
      }
    } else {
      // Mark as offline
      const statusElement = item.querySelector(".friend-status");
      if (statusElement) {
        statusElement.textContent = "offline";
        console.log(`User ${friendId} is offline.`);
      }
    }
  });
}

getOnlineUsers();

export async function disconnectSocket() {
  console.log('___DISCONNECT___SOCKET___CALLED___');
  if (ss.socket) {
    ss.socket.send(JSON.stringify({ type: "set_offline" }));
    markUserOffline();
    ss.socket.close();
    console.log("WebSocket disconnected.");
    ss.socket = null;
  } else {
    console.log("No active WebSocket connection to disconnect.");
  }
}






























// const divs = document.getElementById("window");
window.addEventListener('DOMContentLoaded', function () {
  const hash = window.location.hash.slice(1);
  const [page, query] = hash.split('?');
  const mode = new URLSearchParams(query).get('mode');
  loadPage(page || 'landing', mode);
}, { once: true });

async function loadPage(page, mode = null) {
  const token = localStorage.getItem("jwtToken");

  if (!token && page !== 'landing') {
    page = 'login';
  } else if (token && (page === 'landing' || page === 'login')) {
    page = 'home';
  }

  const existingLink = document.getElementById('page-style');
  if (existingLink) {
    existingLink.remove(); // Remove the old CSS file
  }

  // Validate page
  if (!validPages.includes(page)) {
    page = 'error'; // If page is invalid, go to the error page
  }

  // Dynamically load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `src/css/${page}.css`;
  link.id = 'page-style'; // Assign an ID to the link tag for future removal
  document.head.appendChild(link);

  // Handle page loading and rendering dynamically
  contentDiv.innerHTML = ''; // Clear previous content
  console.log("TMS7 KOLO");

  // Extract query parameters from the URL hash
  const modeToSend = getQueryParamsFromUrl();
  console.log(page, "in LoadPage");

  try {
    if (page === 'landing' || page === 'login') {
      // Clear the content area and load the landing or login page
      let html;
      if (page === 'landing') {
        html = await fetchHtml('src/components/landing.html');
        contentDiv.innerHTML = html;
        initializePageScripts(page);
        // Event listener for landing page interaction
        document.getElementById('startButton').addEventListener('click', () => navigateTo('login'));
      } else if (page === 'login') {
        html = await fetchHtml('login.html');
        contentDiv.innerHTML = html;
        initializePageScripts(page);
      }
    } else {
      // Load component dynamically for other pages
      console.log("weeeeeeeeeeeeee", `src/components/${page}.html`);
      const html = await fetchHtml(`src/components/${page}.html`);
      contentDiv.innerHTML = html;
      console.log("INITIAT SCRIPT :", page);
      initializePageScripts(page, modeToSend);
    }
  } catch (error) {
    console.log("Error loading page:", error);
    const errorMessage = `Failed to load page: ${page}`;
    navigateTo('error', { message: errorMessage });
  }
}

// Helper function to fetch HTML content and handle errors
async function fetchHtml(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorMessage = `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return await response.text();
  } catch (error) {
    throw new Error(error.message);
  }
}

function initializePageScripts(page, mode) {
  console.log("in initializePageScripts");
  // cleanUpCurrentPage();

  const body = document.body;
  const firstChild = body.firstElementChild;
  const appElement = document.getElementById("app");
  // Loop through body children and remove all except the first child and the one with id="app"
  Array.from(body.children).forEach((child) => {
    if (child !== firstChild && child !== appElement) {
      body.removeChild(child);
    }
  });
  // Remove existing script if necessary
  removeAllEventListeners();
  const existingScript = document.getElementById('dynamic-script');
  if (existingScript) {
    existingScript.remove();
  }

  // const clonedContentDiv = contentDiv.cloneNode(true); // False will not clone child nodes, just the div itself
  // contentDiv.parentNode.replaceChild(clonedContentDiv, contentDiv);
  // Dynamically import the relevant module based on the page
  switch (page) {
    case 'home':
      import('./home.js').then(module => {
        module.initHomePage();
      });
      break;
    case 'about':
      import('./about.js').then(module => {
        module.initAboutPage();
      });
      break;
    case 'leaderboard':
      import('./leaderboard.js').then(module => {
        module.initLeaderboardPage();
      });
      break;
    case 'landing':
      import('./landing.js').then(module => {
        module.initLandingPage();
      });
      break;
    case 'login':
      import('./login.js').then(module => {
        module.initLoginPage();
      });
      break;
    case 'play':
      import('./play.js').then(module => {
        module.initPlayPage();
      });
      break;
    case 'profil':
      import('./profil.js').then(module => {
        module.initProfilPage();
      });
      break;
    case 'game':
      import('./game.js').then(module => {
        module.initGamePage(mode);
      });
      break;
    case 'otheruser':
      import('./otheruser.js').then(module => {
        module.initOtherUserPage(mode);
      });
      break;
    case 'error':
      import('./error.js').then(module => {
        module.initErrorPage();
      });
      break;
    default:
      console.log('No script found for this page');
  }
}

function getQueryParamsFromUrl() {
  const hash = window.location.hash;
  const queryString = hash.split('?')[1]; // after '?'
  const urlParams = new URLSearchParams(queryString);
  const modeToGet = urlParams.get('mode');
  console.log(modeToGet);
  if (!modeToGet) {
    const name = urlParams.get('name');
    if (name)
      return name;
  }
  return modeToGet;
}

export function navigateTo(page, queryParams = {}) {
  const queryString = new URLSearchParams(queryParams).toString();
  const hash = queryString ? `#${page}?${queryString}` : `#${page}`;

  const fullUrl = `${window.location.origin}/${hash}`;

  if (window.location.href === fullUrl) {
    console.log("URL unchanged, forcing routing...");
    handleRouting(); // Force routing if the URL is unchanged
    return;
  }

  history.pushState({ page }, '', fullUrl);
  console.log("Navigated to page:", page);
  handleRouting();
}

let lastHash = window.location.hash;

function handleRouting() {
  const hash = window.location.hash.slice(1);

  if (lastHash === hash) return;
  lastHash = hash;

  const [page, query] = hash.split('?');
  const queryParams = new URLSearchParams(query);

  const modeToGet = queryParams.get('mode');

  if (queryParams.has('code')) {
    queryParams.delete('code');
    const cleanedUrl = `${window.location.origin}/${window.location.pathname}#${page}?${queryParams.toString()}`;

    history.replaceState(null, '', cleanedUrl);
  }

  console.log("page in handleRouting To: ", page);

  
  // Load the appropriate page
  loadPage(page || 'landing', modeToGet);
}

// // Add a single event listener for routing
// window.addEventListener('hashchange', handleRouting);
// window.addEventListener('popstate', (event) => {
//   // Ensure proper routing on back/forward navigation
//   handleRouting(event);
// });

if (!window._listenersAdded) {
  window.addEventListener('hashchange', handleRouting);
  window.addEventListener('popstate', (event) => {
    handleRouting(event);
  });
  window._listenersAdded = true;
}

export function removeAllEventListeners() {
  console.log("---------------------");

  console.log(eventRegistry.length, "THEIR LENGTH");
  eventRegistry.forEach(({ element, eventType, handler }) => {
    element.removeEventListener(eventType, handler);
  });
  eventRegistry.length = 0;
  // eventRegistry = [];
  console.log("---------------------");
  console.log(eventRegistry, "ALL DELETED");
}

// Sync session in all tabs
export function syncSession() {
  localStorage.setItem('sessionSync', Date.now());
}

// Listen for `storage` changes in other tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'jwtToken' || event.key === 'sessionSync') {
      const jwtToken = localStorage.getItem('jwtToken');
      if (jwtToken) {
          console.log(`Logged in as user: ${jwtToken}`);
      } else {
          console.log('Logged out');
      }
  }
});

export function sanitizeInput(input) {
  if (typeof input !== 'string') {
      return input; // Return input as is if it's not a string
  }
  return input.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

export function sanitizeObject(obj) {
  if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
  } else if (typeof obj === 'object' && obj !== null) {
      const sanitizedObj = {};
      for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
              sanitizedObj[key] = sanitizeObject(obj[key]);
          }
      }
      return sanitizedObj;
  } else if (typeof obj === 'string') {
      return sanitizeInput(obj);
  } else {
      return obj;
  }
}

export function sanitizeFormData(formData) {
  const sanitizedData = {};
  formData.forEach((value, key) => {
    sanitizedData[key] = sanitizeInput(value);
  });
  return sanitizedData;
}
