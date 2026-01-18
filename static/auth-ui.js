import { register, login } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("reg-email").value;
            const password = document.getElementById("reg-password").value;
            const confirm = document.getElementById("confirm-password").value;

            if (password !== confirm) {
                alert("Passwords do not match!");
                return;
            }

            try {
                await register(email, password);
                toggleAuth('login');
            } catch (err) {
                alert(err.message);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                await login(email, password);
                window.location.href = "index.html";
            } catch (err) {
                alert(err.message);
            }
        });
    }
});
