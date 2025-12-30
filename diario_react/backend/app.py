"""
Diário Pessoal - API Flask
Backend REST API para o aplicativo React
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
from hashlib import sha256
import secrets

app = Flask(__name__)

# Configurações
CORS(app, supports_credentials=True)

# Caminho do banco de dados
DATABASE = 'diario.db'


def get_db_connection():
    """Cria e retorna uma conexão com o banco de dados SQLite"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Inicializa o banco de dados criando as tabelas se não existirem"""
    conn = get_db_connection()

    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')

    conn.execute('''
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Adiciona coluna updated_at se não existir (para bancos já existentes)
    try:
        conn.execute('ALTER TABLE entries ADD COLUMN updated_at TEXT')
    except sqlite3.OperationalError:
        pass  # Coluna já existe

    # Adiciona coluna mood se não existir
    try:
        conn.execute('ALTER TABLE entries ADD COLUMN mood TEXT')
    except sqlite3.OperationalError:
        pass  # Coluna já existe

    # Tabela de tokens de sessão (persistente)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()


def hash_password(password):
    """Cria hash da senha para armazenamento seguro"""
    return sha256(password.encode()).hexdigest()


def get_user_from_token():
    """Obtém o usuário a partir do token no header (do banco de dados)"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]

    conn = get_db_connection()
    session = conn.execute(
        '''SELECT s.user_id, u.username FROM sessions s
           JOIN users u ON s.user_id = u.id
           WHERE s.token = ?''',
        (token,)
    ).fetchone()
    conn.close()

    if session:
        return {
            'id': session['user_id'],
            'username': session['username']
        }
    return None


def login_required(f):
    """Decorator para proteger rotas que requerem autenticação"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_token()
        if not user:
            return jsonify({'error': 'Não autorizado'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function


# ==================== ROTAS DE AUTENTICAÇÃO ====================

@app.route('/api/register', methods=['POST'])
def register():
    """Registra um novo usuário"""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    # Validações
    if not username or not password:
        return jsonify({'error': 'Preencha todos os campos'}), 400

    if len(username) < 3:
        return jsonify({'error': 'O nome de usuário deve ter pelo menos 3 caracteres'}), 400

    if len(password) < 4:
        return jsonify({'error': 'A senha deve ter pelo menos 4 caracteres'}), 400

    conn = get_db_connection()
    existing_user = conn.execute(
        'SELECT id FROM users WHERE username = ?', (username,)
    ).fetchone()

    if existing_user:
        conn.close()
        return jsonify({'error': 'Este nome de usuário já está em uso'}), 400

    created_at = datetime.now().strftime('%d/%m/%Y %H:%M')
    conn.execute(
        'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)',
        (username, hash_password(password), created_at)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': 'Conta criada com sucesso!'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    """Autentica um usuário"""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Preencha todos os campos'}), 400

    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        (username, hash_password(password))
    ).fetchone()
    conn.close()

    if user:
        # Gera um token único e salva no banco
        token = secrets.token_hex(32)
        created_at = datetime.now().strftime('%d/%m/%Y %H:%M')

        conn = get_db_connection()
        conn.execute(
            'INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, ?)',
            (user['id'], token, created_at)
        )
        conn.commit()
        conn.close()

        return jsonify({
            'message': 'Login realizado com sucesso!',
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username']
            }
        }), 200
    else:
        return jsonify({'error': 'Usuário ou senha incorretos'}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    """Encerra a sessão do usuário"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        conn = get_db_connection()
        conn.execute('DELETE FROM sessions WHERE token = ?', (token,))
        conn.commit()
        conn.close()

    return jsonify({'message': 'Logout realizado com sucesso!'}), 200


@app.route('/api/me', methods=['GET'])
def get_current_user():
    """Retorna o usuário logado"""
    user = get_user_from_token()
    if user:
        return jsonify({'user': user}), 200
    return jsonify({'user': None}), 200


# ==================== ROTAS DO DIÁRIO ====================

@app.route('/api/entries', methods=['GET'])
@login_required
def get_entries():
    """Retorna todas as entradas do usuário logado"""
    user = request.current_user

    conn = get_db_connection()
    entries = conn.execute(
        'SELECT * FROM entries WHERE user_id = ? ORDER BY id DESC',
        (user['id'],)
    ).fetchall()
    conn.close()

    entries_list = [
        {
            'id': entry['id'],
            'content': entry['content'],
            'created_at': entry['created_at'],
            'updated_at': entry['updated_at'],
            'mood': entry['mood']
        }
        for entry in entries
    ]

    return jsonify({'entries': entries_list}), 200


@app.route('/api/entries', methods=['POST'])
@login_required
def create_entry():
    """Cria uma nova entrada"""
    user = request.current_user
    data = request.get_json()
    content = data.get('content', '').strip()
    mood = data.get('mood', '').strip() or None

    if not content:
        return jsonify({'error': 'O conteúdo não pode estar vazio'}), 400

    created_at = datetime.now().strftime('%d/%m/%Y %H:%M')

    conn = get_db_connection()
    cursor = conn.execute(
        'INSERT INTO entries (user_id, content, created_at, mood) VALUES (?, ?, ?, ?)',
        (user['id'], content, created_at, mood)
    )
    entry_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Entrada criada com sucesso!',
        'entry': {
            'id': entry_id,
            'content': content,
            'created_at': created_at,
            'mood': mood
        }
    }), 201


@app.route('/api/entries/<int:entry_id>', methods=['PUT'])
@login_required
def update_entry(entry_id):
    """Atualiza uma entrada existente"""
    user = request.current_user
    data = request.get_json()
    content = data.get('content', '').strip()
    mood = data.get('mood', '').strip() or None

    if not content:
        return jsonify({'error': 'O conteúdo não pode estar vazio'}), 400

    conn = get_db_connection()

    # Verifica se a entrada pertence ao usuário
    entry = conn.execute(
        'SELECT * FROM entries WHERE id = ? AND user_id = ?',
        (entry_id, user['id'])
    ).fetchone()

    if not entry:
        conn.close()
        return jsonify({'error': 'Entrada não encontrada'}), 404

    # Atualiza a entrada com a data de edição
    updated_at = datetime.now().strftime('%d/%m/%Y %H:%M')
    conn.execute(
        'UPDATE entries SET content = ?, updated_at = ?, mood = ? WHERE id = ?',
        (content, updated_at, mood, entry_id)
    )
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Entrada atualizada com sucesso!',
        'entry': {
            'id': entry_id,
            'content': content,
            'created_at': entry['created_at'],
            'updated_at': updated_at,
            'mood': mood
        }
    }), 200


@app.route('/api/entries/<int:entry_id>', methods=['DELETE'])
@login_required
def delete_entry(entry_id):
    """Deleta uma entrada"""
    user = request.current_user
    conn = get_db_connection()

    # Verifica se a entrada pertence ao usuário
    entry = conn.execute(
        'SELECT * FROM entries WHERE id = ? AND user_id = ?',
        (entry_id, user['id'])
    ).fetchone()

    if not entry:
        conn.close()
        return jsonify({'error': 'Entrada não encontrada'}), 404

    conn.execute('DELETE FROM entries WHERE id = ?', (entry_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Entrada deletada com sucesso!'}), 200


if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='127.0.0.1', port=5000)
