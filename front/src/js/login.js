import { navigateTo } from "./main.js";
import { syncSession } from "./main.js";
import { eventRegistry } from "./main.js";

// Get the password input and toggle button
export function initLoginPage() {
  document.querySelectorAll('img, p, a, div, button').forEach(function(element) {
    element.setAttribute('draggable', 'false');
  });
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

  function handlem() {
    container.classList.add("active");
  }
  registerBtn.addEventListener("click", handlem);
  eventRegistry.push({
    element: registerBtn,
    eventType: "click",
    handler: handlem
  });

  function handleb() {
    container.classList.remove("active");
  }
  loginBtn.addEventListener("click", handleb);
  eventRegistry.push({
    element: loginBtn,
    eventType: "click",
    handler: handleb
  });

  for (let i = 0; i < passwordToggleBtn.length; i++) {
    // Declare the function outside the loop
    function handlec(event) {
      // Toggle password visibility
      if (passwordInput[i].type === "password") {
        passwordInput[i].type = "text";
        passwordToggleBtn[i].innerHTML =
          '<i class="bi bi-eye" style="color: white;"></i>';
      } else {
        passwordInput[i].type = "password";
        passwordToggleBtn[i].innerHTML =
          '<i class="bi bi-eye-slash" style="color: white;"></i>';
      }
    }

    // Attach the event listener
    passwordToggleBtn[i].addEventListener("click", handlec);

    // Push to event registry
    eventRegistry.push({
      element: passwordToggleBtn[i],
      eventType: "click",
      handler: handlec
    });
  }

  async function handled(event) {
    event.preventDefault(); // Prevent the default signUp submission
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
  }
  document.getElementById("signUpForm").addEventListener("submit", handled);
  eventRegistry.push({
    element: document.getElementById("signUpForm"),
    eventType: "submit",
    handler: handled
  });

  async function handlee(event) {
    event.preventDefault(); // Prevent the default signUp submission
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
          // document.getElementById("qrcode").style.display = "block";
          const QR = rewind.qr_code;
          let image = "data:image/jpg;base64," + QR;
          showQRCodeModal(image);
          async function handlef(event) {
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
                // alert("2FA verification successful!");
                let rewind = await response.json();
                const token = rewind.access;
                localStorage.setItem("jwtToken", token);
                syncSession();
                hideQRCodeModal();
                navigateTo("home");
              } else {
                alert("Failed to verify 2FA. Please try again.");
              }
            } catch (error) {
              console.error("Error:", error);
              alert("An error occurred while verifying 2FA.");
            }
          }
          document.getElementById('qrc').addEventListener("click", handlef);
            eventRegistry.push({
              element: document.getElementById('qrc'),
              eventType: "click",
              handler: handlef
            });
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
  }
  document.getElementById("loginForm").addEventListener("submit", handlee);

  eventRegistry.push({
    element: document.getElementById("loginForm"),
    eventType: "submit",
    handler: handlee
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

  function handleg(e) {
    e.preventDefault();
    signUpForm.style.display = "block";
    signInForm.style.display = "none";
  }

  toSignupButton.addEventListener("click", handleg);
    eventRegistry.push({
      element: toSignupButton,
      eventType: "click",
      handler: handleg
    });

  // Toggle to show sign-in form
  function handleh(e) {
    e.preventDefault();
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
  }
  toSigninButton.addEventListener("click", handleh);
    eventRegistry.push({
      element: toSigninButton,
      eventType: "click",
      handler: handleh
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
}