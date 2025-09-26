from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

app = Flask(__name__, static_folder="static", template_folder="templates")

# --- DBユーティリティ -------------------------------------------------
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

# 起動時にテーブル作成
init_db()

# --- ページ（HTML） ----------------------------------------------------
@app.route("/")
def root():
    return render_template("index.html")

@app.route("/index.html")
def index_html():
    return render_template("index.html")

@app.route("/login.html")
def login_html():
    return render_template("login.html")

@app.route("/register.html")
def register_html():
    return render_template("register.html")

# --- API（Nodeの仕様に等価） ------------------------------------------
@app.post("/api/register")
def api_register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "ユーザー名とパスワードを入力してください。"}), 400

    pw_hash = generate_password_hash(password)  # pbkdf2:sha256

    try:
        conn = get_db()
        conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, pw_hash))
        conn.commit()
        conn.close()
        return jsonify({"message": "ユーザー登録が完了しました。"}), 201
    except sqlite3.IntegrityError:
        # UNIQUE制約違反
        return jsonify({"message": "このユーザー名は既に使用されています。"}), 409
    except Exception:
        return jsonify({"message": "データベースエラーが発生しました。"}), 500

@app.post("/api/login")
def api_login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "ユーザー名とパスワードを入力してください。"}), 400

    try:
        conn = get_db()
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        conn.close()
        if not row:
            return jsonify({"message": "ユーザー名またはパスワードが間違っています。"}), 401

        if check_password_hash(row["password"], password):
            return jsonify({"message": "ログインに成功しました。", "username": row["username"]}), 200
        else:
            return jsonify({"message": "ユーザー名またはパスワードが間違っています。"}), 401
    except Exception:
        return jsonify({"message": "データベースエラーが発生しました。"}), 500

# --- 静的ファイルの直リンク互換（必要なら） ---------------------------
@app.route("/<path:filename>")
def passthrough(filename):
    # 例: 既存のリンクで login.html を直叩きしたい人向け
    if filename.endswith(".html"):
        try:
            return render_template(filename)
        except:
            pass
    # それ以外は静的から探す
    static_path = os.path.join(app.static_folder, filename)
    if os.path.exists(static_path):
        return send_from_directory(app.static_folder, filename)
    # 見つからないときはトップへ
    return render_template("index.html")

if __name__ == "__main__":
    # 開発用サーバ
    app.run(host="127.0.0.1", port=5000, debug=True)
