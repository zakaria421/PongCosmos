import { navigateTo } from "./main.js";

export function initErrorPage() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const errorMessage = params.get('message') || 'An unexpected error occurred';


    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = errorMessage;
    } else {
        const errorFallbackDiv = document.createElement('div');
        errorFallbackDiv.textContent = errorMessage;
        document.body.appendChild(errorFallbackDiv);
    }

    const goHomeButton = document.getElementById('go-home');
    if (goHomeButton) {
        goHomeButton.addEventListener('click', () => {
            navigateTo('landing');
        });
    } else {
        console.error('Go Home button not found.');
    }
}
