import { navigateTo } from "./main.js";

export function initLandingPage() {
  console.log("LANDING PAGE");

  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get("code");

  if (authCode) {
    console.log("Authorization Code:", authCode);
    showSpinner(); // Show the spinner when redirect happens
    fetchOAuthCode(authCode);
  } else {
    console.log("No authorization code found.");
  }
}

async function fetchOAuthCode(authCode) {
  try {
    console.log("before");
    console.log("-------------------------------FETCHING-----------------------");
    const response = await fetch(
      "http://0.0.0.0:8000/oauthcallback?code=" + authCode
    );
    if (response.ok) {
      console.log("AFTER");
      console.log("Authentication initiated successfully");

      const rewind = await response.json();
      const token = rewind.access;
      // Set the cookie to expire in 7 days
      // const date = new Date();
      // date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
      // document.cookie = `jwtToken=${token}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
      // console.log(document.cookie);
      localStorage.setItem("jwtToken", token);
      console.log("TOKEN in landing page: ",localStorage.getItem("jwtToken"));
      hideSpinner(); // Hide spinner before navigating
      navigateTo("home");
    } else {
      console.error("Failed to initiate authentication");
      hideSpinner();
    }
  } catch (error) {
    console.error("Login failed:", error);
    hideSpinner();
  }
}

// Spinner functions
function showSpinner() {
  const spinner = document.getElementById("spinnerContainer");
  spinner.classList.remove("d-none");
}

function hideSpinner() {
  const spinner = document.getElementById("spinnerContainer");
  spinner.classList.add("d-none");
}
