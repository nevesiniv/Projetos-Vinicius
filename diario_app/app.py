"""
Diário Pessoal - Aplicação Flask
Backend principal com rotas, autenticação e conexão ao banco de dados SQLite
"""

from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
from datetime import datetime
from hashlib import sha256

app = Flask(__name__)

# Chave secreta para sessões (necessária para login)
app.secret_key = 'diario_pessoal_chave_secreta_2025'

# Caminho do banco de dados
DATABASE = 'diario.db'


def get_db_connection():
    """Cria e retorna uma conexão com o banco de dados SQLite"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas por nome
    return conn


def init_db():
    """Inicializa o banco de dados criando as tabelas se não existirem"""
    conn = get_db_connection()

    # Tabela de usuários
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')

    # Tabela de entradas (agora com user_id)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()


def hash_password(password):
    """Cria hash da senha para armazenamento seguro"""
    return sha256(password.encode()).hexdigest()


def get_current_user():
    """Retorna o usuário logado ou None"""
    if 'user_id' in session:
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE id = ?', (session['user_id'],)
        ).fetchone()
        conn.close()
        return user
    return None


# ==================== ROTAS DE AUTENTICAÇÃO ====================

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Página de registro de novo usuário"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()

        # Validações
        if not username or not password:
            flash('Preencha todos os campos.', 'error')
            return render_template('register.html')

        if len(username) < 3:
            flash('O nome de usuário deve ter pelo menos 3 caracteres.', 'error')
            return render_template('register.html')

        if len(password) < 4:
            flash('A senha deve ter pelo menos 4 caracteres.', 'error')
            return render_template('register.html')

        if password != confirm_password:
            flash('As senhas não coincidem.', 'error')
            return render_template('register.html')

        # Verifica se usuário já existe
        conn = get_db_connection()
        existing_user = conn.execute(
            'SELECT id FROM users WHERE username = ?', (username,)
        ).fetchone()

        if existing_user:
            conn.close()
            flash('Este nome de usuário já está em uso.', 'error')
            return render_template('register.html')

        # Cria o usuário
        created_at = datetime.now().strftime('%d/%m/%Y %H:%M')
        conn.execute(
            'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)',
            (username, hash_password(password), created_at)
        )
        conn.commit()
        conn.close()

        flash('Conta criada com sucesso! Faça login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Página de login"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        if not username or not password:
            flash('Preencha todos os campos.', 'error')
            return render_template('login.html')

        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            (username, hash_password(password))
        ).fetchone()
        conn.close()

        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash(f'Bem-vindo, {user["username"]}!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Usuário ou senha incorretos.', 'error')
            return render_template('login.html')

    return render_template('login.html')


@app.route('/logout')
def logout():
    """Encerra a sessão do usuário"""
    session.clear()
    flash('Você saiu da sua conta.', 'success')
    return redirect(url_for('login'))


# ==================== ROTAS DO DIÁRIO ====================

@app.route('/')
def index():
    """Página inicial - Lista todas as entradas do usuário logado"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))

    conn = get_db_connection()
    entries = conn.execute(
        'SELECT * FROM entries WHERE user_id = ? ORDER BY created_at DESC',
        (user['id'],)
    ).fetchall()
    conn.close()

    return render_template('index.html', entries=entries, user=user)


@app.route('/new', methods=['GET'])
def new_entry_form():
    """Exibe o formulário para criar nova entrada"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))

    return render_template('new_entry.html', user=user)


@app.route('/new', methods=['POST'])
def new_entry_save():
    """Salva uma nova entrada no banco de dados"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))

    content = request.form.get('content', '').strip()

    if content:
        # Gera data e hora automaticamente no formato brasileiro
        created_at = datetime.now().strftime('%d/%m/%Y %H:%M')

        conn = get_db_connection()
        conn.execute(
            'INSERT INTO entries (user_id, content, created_at) VALUES (?, ?, ?)',
            (user['id'], content, created_at)
        )
        conn.commit()
        conn.close()

    return redirect(url_for('index'))


if __name__ == '__main__':
    # Inicializa o banco de dados ao iniciar a aplicação
    init_db()
    # Roda o servidor em modo debug na porta 5000
    app.run(debug=True, host='127.0.0.1', port=5000)
