document.addEventListener('DOMContentLoaded', () => {
    // --- ログイン状態による表示切替 ---
    const loggedIn = sessionStorage.getItem('loggedIn');
    const username = sessionStorage.getItem('username');

    const loginItem = document.getElementById('login-item');
    const registerItem = document.getElementById('register-item');
    const welcomeItem = document.getElementById('welcome-item');
    const logoutItem = document.getElementById('logout-item');
    const logoutLink = document.getElementById('logout-link');

    if (loggedIn === 'true' && username) {
        // ログインしている場合
        if (loginItem) loginItem.style.display = 'none';
        if (registerItem) registerItem.style.display = 'none';

        if (welcomeItem) {
            welcomeItem.style.display = 'list-item';
            welcomeItem.querySelector('.welcome-message').textContent = `ようこそ、${username}さん`;
        }
        if (logoutItem) logoutItem.style.display = 'list-item';

        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('loggedIn');
                sessionStorage.removeItem('username');
                window.location.reload();
            });
        }
    } else {
        // ログインしていない場合
        if (loginItem) loginItem.style.display = 'list-item';
        if (registerItem) registerItem.style.display = 'list-item';
        if (welcomeItem) welcomeItem.style.display = 'none';
        if (logoutItem) logoutItem.style.display = 'none';
    }

    // --- ハンバーガーメニューの処理 ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.getElementById('hamburger-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const expanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!expanded));
            navLinks.classList.toggle('show');
        });
    }

    // --- トップへ戻るボタンの処理 ---
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        const onScroll = () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        };
        document.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
});
