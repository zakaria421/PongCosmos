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
      const bool = rewind.twoFa;
      console.log("TOKEENEENENENEN e", token);
      if (bool) {
        document.getElementById("qrcode").style.display = "block";
        const QR = rewind.qr_code;
        let image = "data:image/jpg;base64," + QR;
        console.log(image);
        document.getElementById("QR").src = image;
        document.getElementById('qrc').addEventListener("click", async function (event) {
          event.preventDefault();
          try {
            console.log("COOODE : : : :" + document.querySelector('#qrcode input[type="text"]').value);
            const response = await fetch(`http://0.0.0.0:8000/2fa/verify/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                otp: document.querySelector('#qrcode input[type="text"]').value,
              }),
            });
            if (response.ok) {
              alert("2FA verification successful!");
              let rewind = await response.json();
              const token = rewind.access;
              localStorage.setItem("jwtToken", token);
              hideSpinner();
              navigateTo("home");
            } else {
              alert("Failed to verify 2FA. Please try again.");
            }
          } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while verifying 2FA.");
          }
        });

        if (response.ok) {
          console.log("2FA auth done");
        }
      } else {
        localStorage.setItem("jwtToken", token);
        hideSpinner();
        navigateTo("home");
      }
    } else {
      console.error("Failed to initiate authentication");
      hideSpinner();
    }
  }
  catch (error) {
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
