document.addEventListener("DOMContentLoaded", () => {
  // ナビの表示切替（任意実装）
  const username = localStorage.getItem("loggedInUser");
  const loginItem = document.getElementById("login-item");
  const registerItem = document.getElementById("register-item");
  const welcomeItem = document.getElementById("welcome-item");
  const logoutItem = document.getElementById("logout-item");
  const welcomeMsg = document.querySelector(".welcome-message");
  const logoutLink = document.getElementById("logout-link");

  if (username && welcomeItem && logoutItem && welcomeMsg) {
    if (loginItem) loginItem.style.display = "none";
    if (registerItem) registerItem.style.display = "none";
    welcomeMsg.textContent = `ようこそ、${username} さん`;
    welcomeItem.style.display = "inline-block";
    logoutItem.style.display = "inline-block";
  }

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedInUser");
      location.reload();
    });
  }

  // ハンバーガーの開閉（既存のボタンに合わせて）
  const hamburgerBtn = document.querySelector(".hamburger");
  const links = document.getElementById("hamburger-links");
  if (hamburgerBtn && links) {
    hamburgerBtn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      hamburgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
});
