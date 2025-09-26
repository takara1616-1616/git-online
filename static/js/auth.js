// register.html / login.html 共通の最小ロジック

document.addEventListener("DOMContentLoaded", () => {
  const regForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");

  // 新規登録
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("reg-username").value.trim();
      const password = document.getElementById("reg-password").value;

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      const msg = document.getElementById("register-message");
      msg.textContent = data.message || "";

      if (res.status === 201) {
        // 成功したらログインページへ
        setTimeout(() => location.href = "login.html", 500);
      }
    });
  }

  // ログイン
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      const err = document.getElementById("login-error-message");
      if (res.ok) {
        // 簡易的に LocalStorage に保存（本番はセッション/JWT推奨）
        localStorage.setItem("loggedInUser", data.username);
        location.href = "index.html";
      } else {
        err.textContent = data.message || "ログインに失敗しました。";
      }
    });
  }
});
