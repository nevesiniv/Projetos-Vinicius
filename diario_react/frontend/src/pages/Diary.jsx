import { useState, useEffect } from 'react';
import { getEntries, createEntry, updateEntry, deleteEntry, logout } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import './Diary.css';

function Diary({ user, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Estado para edição
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  // Estado para busca
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para modal de confirmação
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, entryId: null });

  // Estado para toast de feedback
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await getEntries();
      if (data.entries) {
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Erro ao carregar entradas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtra entradas pelo termo de busca
  const filteredEntries = entries.filter((entry) =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.created_at.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    setSaving(true);
    try {
      const data = await createEntry(newEntry);
      if (data.entry) {
        setEntries([data.entry, ...entries]);
        setNewEntry('');
        setShowForm(false);
        showToast('Entrada criada com sucesso!', 'success');
      }
    } catch (err) {
      console.error('Erro ao criar entrada:', err);
      showToast('Erro ao criar entrada', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditingContent(entry.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async (entryId) => {
    if (!editingContent.trim()) return;

    setSaving(true);
    try {
      const data = await updateEntry(entryId, editingContent);
      if (data.entry) {
        setEntries(entries.map((entry) =>
          entry.id === entryId ? { ...entry, content: editingContent, updated_at: data.entry.updated_at } : entry
        ));
        setEditingId(null);
        setEditingContent('');
        showToast('Entrada atualizada com sucesso!', 'success');
      }
    } catch (err) {
      console.error('Erro ao editar entrada:', err);
      showToast('Erro ao atualizar entrada', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (entryId) => {
    setDeleteModal({ isOpen: true, entryId });
  };

  const handleConfirmDelete = async () => {
    const entryId = deleteModal.entryId;
    setDeleteModal({ isOpen: false, entryId: null });

    try {
      await deleteEntry(entryId);
      setEntries(entries.filter((entry) => entry.id !== entryId));
      showToast('Entrada excluída com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao deletar entrada:', err);
      showToast('Erro ao excluir entrada', 'error');
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, entryId: null });
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="diary-container">
      <header className="diary-header">
        <div className="header-left">
          <div className="header-logo">📔</div>
          <h1>Meu Diário</h1>
        </div>
        <div className="header-right">
          <div className="user-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-greeting">{user.username}</span>
            <span className="user-label">Minha conta</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      <main className="diary-main">
        <div className="diary-actions">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-new-entry"
          >
            {showForm ? 'Cancelar' : '+ Nova Entrada'}
          </button>

          {entries.length > 0 && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar entradas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="search-clear"
                  title="Limpar busca"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="entry-form">
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="O que está pensando hoje? Escreva seus pensamentos..."
              rows={6}
              required
            />
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Entrada'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando suas entradas...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>Seu diário está vazio</h2>
            <p>Comece a escrever seus pensamentos clicando em "Nova Entrada"</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>Nenhuma entrada encontrada</h2>
            <p>Não encontramos entradas com "{searchTerm}"</p>
          </div>
        ) : (
          <>
            {searchTerm && (
              <p className="search-results">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entrada encontrada' : 'entradas encontradas'}
              </p>
            )}
            <div className="entries-list">
              {filteredEntries.map((entry) => (
                <article key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <div className="entry-dates">
                      <span className="entry-date">{entry.created_at}</span>
                      {entry.updated_at && (
                        <span className="entry-edited">Editado em {entry.updated_at}</span>
                      )}
                    </div>
                    <div className="entry-actions">
                      {editingId !== entry.id && (
                        <button
                          onClick={() => handleEdit(entry)}
                          className="btn-edit"
                          title="Editar entrada"
                        >
                          ✎
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className="btn-delete"
                        title="Excluir entrada"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {editingId === entry.id ? (
                    <div className="edit-form">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={4}
                      />
                      <div className="edit-actions">
                        <button
                          onClick={() => handleSaveEdit(entry.id)}
                          className="btn-save-edit"
                          disabled={saving}
                        >
                          {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-cancel-edit"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="entry-content">{entry.content}</p>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Excluir entrada"
        message="Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

export default Diary;
