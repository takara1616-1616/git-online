from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

# ========================================
# 設定
# ========================================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

# Flask アプリ本体
app = Flask(__name__, static_folder="static", template_folder="templates")


# ========================================
# DBユーティリティ
# ========================================
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


# ========================================
# ページルーティング（HTML表示）
# ========================================
@app.route("/")
def root():
    # トップページ（index.html）
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


# ========================================
# APIエンドポイント
# ========================================
@app.post("/api/register")
def api_register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"message": "ユーザー名とパスワードを入力してください。"}), 400

    pw_hash = generate_password_hash(password)

    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, pw_hash)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "ユーザー登録が完了しました。"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"message": "このユーザー名は既に使用されています。"}), 409
    except Exception as e:
        print("Register error:", e)
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
    except Exception as e:
        print("Login error:", e)
        return jsonify({"message": "データベースエラーが発生しました。"}), 500


# ========================================
# 静的ファイル・互換用ルート
# ========================================
@app.route("/<path:filename>")
def passthrough(filename):
    """
    /login.html などを直リンクで叩きたい場合に互換的に対応。
    それ以外は static/ から探して返す。
    """
    if filename.endswith(".html"):
        try:
            return render_template(filename)
        except:
            pass

    static_path = os.path.join(app.static_folder, filename)
    if os.path.exists(static_path):
        return send_from_directory(app.static_folder, filename)

    return render_template("index.html")


# ========================================
# エントリーポイント
# ========================================
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
