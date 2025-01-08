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

const ss = { socket: null };

export default ss;

let userData = null;

statusCheck();

export async function statusCheck() {
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
      await markUserOnline(token);

      setupWebSocket(userData.id);
    }else if (response.status === 401) {
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
    ss.socket.send(JSON.stringify({ type: "onlineCheck" }));
  };

  ss.socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.type === "onlineCheckResponse") {
    } else if (data.type === "user.status") {
        if (data.status == 'online') {
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
    if (statusElement) {
      statusElement.textContent = status;
    }
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
      updateOnlineUsersUI(data.online_users);
    }else if (response.status === 401) {
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
  friendItems.forEach((item) => {
    const friendId = item.getAttribute("data-friend-id");

    if (onlineUsers.includes(parseInt(friendId))) {
      const statusElement = item.querySelector(".friend-status");
      if (statusElement) {
        statusElement.textContent = "online";
      }
    } else {
      // Mark as offline
      const statusElement = item.querySelector(".friend-status");
      if (statusElement) {
        statusElement.textContent = "offline";
      }
    }
  });
}

getOnlineUsers();

export async function disconnectSocket() {
  if (ss.socket) {
    ss.socket.send(JSON.stringify({ type: "set_offline" }));
    markUserOffline();
    ss.socket.close();
    ss.socket = null;
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

  // Extract query parameters from the URL hash
  const modeToSend = getQueryParamsFromUrl();

  try {
    if (page === 'landing' || page === 'login') {
      // Clear the content area and load the landing or login page
      let html;
      if (page === 'landing') {
        html = await fetchHtml('src/components/landing.html');
        contentDiv.innerHTML = html;
        initializePageScripts(page);
        document.getElementById('startButton').addEventListener('click', () => navigateTo('login'));
      } else if (page === 'login') {
        html = await fetchHtml('login.html');
        contentDiv.innerHTML = html;
        initializePageScripts(page);
      }
    } else {
      const html = await fetchHtml(`src/components/${page}.html`);
      contentDiv.innerHTML = html;
      initializePageScripts(page, modeToSend);
    }
  } catch (error) {
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

  const body = document.body;
  const firstChild = body.firstElementChild;
  const appElement = document.getElementById("app");
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
    handleRouting(); // Force routing if the URL is unchanged
    return;
  }

  history.pushState({ page }, '', fullUrl);
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
  
  loadPage(page || 'landing', modeToGet);
}

if (!window._listenersAdded) {
  window.addEventListener('hashchange', handleRouting);
  window.addEventListener('popstate', (event) => {
    handleRouting(event);
  });
  window._listenersAdded = true;
}

export function removeAllEventListeners() {
  eventRegistry.forEach(({ element, eventType, handler }) => {
    element.removeEventListener(eventType, handler);
  });
  eventRegistry.length = 0;
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
