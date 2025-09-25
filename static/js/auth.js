document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginErrorMessage = document.getElementById('login-error-message');
    const registerMessage = document.getElementById('register-message');

    // ログイン処理
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginErrorMessage.textContent = '';

            const username = e.target.username.value;
            const password = e.target.password.value;

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await res.json();

                if (res.ok) {
                    // ログイン成功
                    sessionStorage.setItem('loggedIn', 'true');
                    sessionStorage.setItem('username', data.username);
                    window.location.href = 'index.html';
                } else {
                    // ログイン失敗
                    loginErrorMessage.textContent = data.message;
                }
            } catch (error) {
                loginErrorMessage.textContent = '通信エラーが発生しました。';
            }
        });
    }

    // 新規登録処理
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            registerMessage.textContent = '';
            registerMessage.className = 'message';


            const username = e.target.username.value;
            const password = e.target.password.value;

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await res.json();

                if (res.ok) {
                    // 登録成功
                    registerMessage.textContent = data.message;
                    registerMessage.classList.add('success');
                    registerForm.reset(); // フォームをリセット
                } else {
                    // 登録失敗
                    registerMessage.textContent = data.message;
                    registerMessage.classList.add('error');
                }
            } catch (error) {
                registerMessage.textContent = '通信エラーが発生しました。';
                registerMessage.classList.add('error');
            }
        });
    }
});
