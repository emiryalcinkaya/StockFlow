import { apiFetch, setToken, getToken, clearToken } from "./config.js";
import { showToast, setButtonLoading } from "./ui.js";

export function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "index.html";
  }
}

export function logout() {
  clearToken();
  window.location.href = "index.html";
}

export function initSidebarLogout() {
  const logoutButtons = document.querySelectorAll("[data-logout]");
  logoutButtons.forEach((button) => {
    button.addEventListener("click", logout);
  });
}

export function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const messageEl = document.getElementById("message");
    const button = document.getElementById("loginButton");

    messageEl.textContent = "";
    setButtonLoading(button, true, "Signing in...");

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        messageEl.textContent = data.detail || "Login failed";
        messageEl.className = "form-message error";
        setButtonLoading(button, false);
        return;
      }

      setToken(data.access_token);
      messageEl.textContent = "Login successful!";
      messageEl.className = "form-message success";
      showToast("Welcome back", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    } catch (error) {
      console.error(error);
      messageEl.textContent = "Request failed";
      messageEl.className = "form-message error";
    } finally {
      setButtonLoading(button, false);
    }
  });
}