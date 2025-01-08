import { navigateTo } from "./main.js";
import { eventRegistry } from "./main.js";
import { syncSession } from "./main.js";
import { sanitizeInput } from "./main.js";
import { statusCheck } from "./main.js";

export function initLandingPage() {
  document.querySelectorAll('img, p, a, div, button').forEach(function(element) {
    element.setAttribute('draggable', 'false');
  });

  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get("code");

  if (authCode && /^[a-zA-Z0-9_-]+$/.test(authCode)) {
    showSpinner();
    fetchOAuthCode(authCode);
  }

  document.getElementById('closeQRCodeModal').addEventListener('click', () => {
    document.getElementById('qrcode').style.display = 'none';
  });
  
}

function validateOTP(otp) {
  return /^\d{6}$/.test(otp);
}

async function fetchOAuthCode(authCode) {
  try {
    const response = await fetch(
      "https://10.12.8.11:8443/api/oauthcallback?code=" + authCode
    );
    if (response.ok) {
      const rewind = await response.json();
      const token = rewind.access;
      const refresh = rewind.refresh;
      localStorage.setItem("refresh", refresh);
      const bool = rewind.twoFa;
      if (bool) {
        const QR = rewind.qr_code;
        let image = "data:image/jpg;base64," + QR;
        showQRCodeModal(image);

        const qrcElement = document.getElementById('qrc');
          async function handleri(event) {
            event.preventDefault();
            try {
              const otpInput = sanitizeInput(document.querySelector('#qrcode input[type="text"]').value);
              if (!validateOTP(otpInput)) {
                alert("Invalid OTP. Please enter a 6-digit code.");
                return;
              }
              const response = await fetch(`https://10.12.8.11:8443/api/2fa/verify/`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  otp: otpInput,
                }),
              });
              if (response.ok) {
                let rewind = await response.json();
                const token = rewind.access;
                localStorage.setItem("jwtToken", token);
                syncSession();
                hideSpinner();
                hideQRCodeModal();
                await statusCheck();
                navigateTo("home");
              } else {
                alert("Failed to verify 2FA. Please try again.");
              }
            } catch (error) {
              console.error("Error:", error);
              alert("An error occurred while verifying 2FA.");
            }
          }
          qrcElement.addEventListener("click", handleri);
          eventRegistry.push({
            element: qrcElement,
            eventType: "click",
            handler: handleri
          });
      } else {
        localStorage.setItem("jwtToken", token);
        syncSession();
        hideSpinner();
        hideQRCodeModal();
        await statusCheck();
        navigateTo("home");
      }
    } else {
      console.error("Failed to initiate authentication");
      hideSpinner();
      hideQRCodeModal();
    }
  }
  catch (error) {
    console.error("Login failed:", error);
    hideSpinner();
    hideQRCodeModal();
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

function showQRCodeModal(imageSrc) {
  const qrcode = document.getElementById("qrcode");
  qrcode.style.display = "flex";
  document.body.classList.add("modal-active");
  const qrImage = document.getElementById("QR");
  qrImage.src = imageSrc;
}

function hideQRCodeModal() {
  const qrcode = document.getElementById("qrcode");
  document.body.classList.remove("modal-active");
  qrcode.style.display = "none";
}