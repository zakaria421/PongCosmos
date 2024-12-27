import { navigateTo } from "./main.js";

export function initErrorPage() {
    const errorMessage = new URLSearchParams(window.location.hash.split('?')[1]).get('message') || 'An unexpected error occurred';
    console.log(errorMessage);
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerHTML = errorMessage;
    console.log("Error page initialized:", errorMessage);
    document.getElementById('go-home').addEventListener('click', () => {
        navigateTo('landing');
    });
}
