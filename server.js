const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// データベース接続
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('データベースに接続しました。');
});

// usersテーブルを作成
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

// POSTリクエストのbodyをJSONとして解析するためのミドルウェア
app.use(express.json());
// 静的ファイル（HTML, CSS, JS）を配信するための設定
app.use(express.static(path.join(__dirname, '.')));


// --- APIエンドポイント ---

// 新規登録API
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'ユーザー名とパスワードを入力してください。' });
    }

    try {
        // パスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
        db.run(sql, [username, hashedPassword], function(err) {
            if (err) {
                // ユーザー名が既に存在する場合
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ message: 'このユーザー名は既に使用されています。' });
                }
                return res.status(500).json({ message: 'データベースエラーが発生しました。' });
            }
            res.status(201).json({ message: 'ユーザー登録が完了しました。' });
        });
    } catch (error) {
        res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
});

// ログインAPI
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'ユーザー名とパスワードを入力してください。' });
    }

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'データベースエラーが発生しました。' });
        }
        if (!user) {
            return res.status(401).json({ message: 'ユーザー名またはパスワードが間違っています。' });
        }

        // パスワードを比較
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.status(200).json({ message: 'ログインに成功しました。', username: user.username });
        } else {
            res.status(401).json({ message: 'ユーザー名またはパスワードが間違っています。' });
        }
    });
});


// サーバーを起動
app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました`);
});
