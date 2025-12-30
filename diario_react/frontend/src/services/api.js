const API_URL = 'http://127.0.0.1:5000/api';

// Obtém o token salvo no localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Salva o token no localStorage
export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

// Configuração padrão para todas as requisições
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// ==================== AUTENTICAÇÃO ====================

export async function register(username, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function login(username, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  // Salva o token se o login foi bem sucedido
  if (data.token) {
    setToken(data.token);
  }

  return data;
}

export async function logout() {
  const response = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: getHeaders(),
  });

  // Remove o token
  setToken(null);

  return response.json();
}

export async function getCurrentUser() {
  const token = getToken();
  if (!token) {
    return { user: null };
  }

  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return response.json();
}

// ==================== ENTRADAS DO DIÁRIO ====================

export async function getEntries() {
  const response = await fetch(`${API_URL}/entries`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return response.json();
}

export async function createEntry(content, mood = null) {
  const response = await fetch(`${API_URL}/entries`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content, mood }),
  });
  return response.json();
}

export async function updateEntry(entryId, content, mood = null) {
  const response = await fetch(`${API_URL}/entries/${entryId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ content, mood }),
  });
  return response.json();
}

export async function deleteEntry(entryId) {
  const response = await fetch(`${API_URL}/entries/${entryId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
}
