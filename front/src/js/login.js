import { navigateTo } from "./main.js";
import { syncSession } from "./main.js";
import { eventRegistry } from "./main.js";

// Get the password input and toggle button
export function initLoginPage() {
  const passwordInput = document.getElementsByClassName("passwordInput");
  const passwordToggleBtn =
    document.getElementsByClassName("passwordToggleBtn");
  const passwordSimilar1 = document.getElementById("passW1");
  const passwordSimilar2 = document.getElementById("passW2");
  const email = document.getElementById("email");
  const name = document.getElementById("name");

  // shifting
  const container = document.getElementById("container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

  registerBtn.addEventListener("click", function handleM() {
    eventRegistry.push({
      element: registerBtn,
      eventType: "click",
      handler: handleM
    });
    container.classList.add("active");
  });

  loginBtn.addEventListener("click", function handleB() {
    eventRegistry.push({
      element: loginBtn,
      eventType: "click",
      handler: handleB
    });
    container.classList.remove("active");
  });

  // Add event listener to toggle button
  for (let i = 0; i < passwordToggleBtn.length; i++) {
    passwordToggleBtn[i].addEventListener("click", function handleC() {
      eventRegistry.push({
        element: passwordToggleBtn[i],
        eventType: "click",
        handler: handleC
      });
      // console.log("Toggle button clicked");
      // Toggle password visibility
      if (passwordInput[i].type === "password") {
        passwordInput[i].type = "text";
        passwordToggleBtn[i].innerHTML =
          '<i class="bi bi-eye" style="color: black;"></i>';
      } else {
        passwordInput[i].type = "password";
        passwordToggleBtn[i].innerHTML =
          '<i class="bi bi-eye-slash" style="color: black;"></i>';
      }
    });
  }
  document
    .getElementById("signUpForm")
    .addEventListener("submit", async function handleD(event) {
      event.preventDefault(); // Prevent the default signUp submission
      eventRegistry.push({
        element: document.getElementById("signUpForm"),
        eventType: "submit",
        handler: handleD
      });
      if (passwordSimilar1.value != passwordSimilar2.value) {
        alert("Password does not meet the requirements.");
        return;
      }
      const formData = new FormData(this);
      console.log("FORM: ", formData);
      try {
        let response = await fetch("http://0.0.0.0:8000/signup/", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "POST",
          body: formDataToJson(formData),
        });
        if (response.ok) {
          passwordSimilar1.value = "";
          name.value = "";
          email.value = "";
          passwordSimilar2.value = "";
          container.classList.remove("active");
        }
        else {
          alert("The nickname you entered is already in use. Please choose a different nickname.");
        }
      } catch (error) {
        alert("Account creation failed. Please try again.");
      }
    });

  document
    .getElementById("loginForm")
    .addEventListener("submit", async function handleE(event) {
      event.preventDefault(); // Prevent the default signUp submission
      eventRegistry.push({
        element: document.getElementById("loginForm"),
        eventType: "submit",
        handler: handleE
      });
      const formData = new FormData(this);
      // console.log(formData.get("nickname"));
      // console.log(formData.get("password"));
      // console.log(formData.get('email'));
      // console.log(formData);
      try {
        let response = await fetch("http://0.0.0.0:8000/signin/", {
          // Specify the server endpoint directly
          headers: {
            "Content-Type": "application/json", // Ensure the content type is set to JSON
            Accept: "application/json", // Optionally, specify the format you want the response in
          },
          method: "POST",
          body: formDataToJson(formData),
        });
        if (response.ok) {
          let rewind = await response.json();
          const token = rewind.access;
          const bool = rewind.twoFa;
          console.log("TOKEENEENENENEN e", token);
          if (bool) {
            document.getElementById("qrcode").style.display = "block";
            const QR = rewind.qr_code;
            let image = "data:image/jpg;base64," + QR;
            console.log(image);
            document.getElementById("QR").src = image;
            document.getElementById('qrc').addEventListener("click", async function handleF(event) {
              event.preventDefault();
              eventRegistry.push({
                element: document.getElementById('qrc'),
                eventType: "click",
                handler: handleF
              });
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
                  syncSession();
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
          }
          else {
            localStorage.setItem("jwtToken", token);
            syncSession();
            navigateTo("home");
          }
        }
      } catch (error) {
      console.error("Error occured: ", error);
    }
});

function formDataToJson(formData) {
  const obj = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return JSON.stringify(obj);
}

const signInForm = document.querySelector(".sign-in");
const signUpForm = document.querySelector(".sign-up");
const toSignupButton = document.getElementById("to-signup");
const toSigninButton = document.getElementById("to-signin");

// signUpForm.style.display = "none";

toSignupButton.addEventListener("click", function handleG(e) {
  e.preventDefault();
  eventRegistry.push({
    element: toSignupButton,
    eventType: "click",
    handler: handleG
  });
  signUpForm.style.display = "block";
  signInForm.style.display = "none";
});

// Toggle to show sign-in form
toSigninButton.addEventListener("click", function handleH(e) {
  e.preventDefault();
  eventRegistry.push({
    element: toSigninButton,
    eventType: "click",
    handler: handleH
  });
  signInForm.style.display = "block";
  signUpForm.style.display = "none";
});

// Function to check window width and remove class
function checkWindowSize() {
  if (window.innerWidth < 768) {
    container.classList.remove("active");
  } else {
    signInForm.style.display = "block";
    signUpForm.style.display = "block";
  }
}

window.addEventListener("resize", checkWindowSize);
eventRegistry.push({
  element: window,
  eventType: "resize",
  handler: checkWindowSize
});
checkWindowSize();
}