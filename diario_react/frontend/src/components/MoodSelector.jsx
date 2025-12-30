import './MoodSelector.css';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Feliz', color: '#10b981' },
  { id: 'excited', emoji: '🎉', label: 'Animado', color: '#f59e0b' },
  { id: 'calm', emoji: '😌', label: 'Calmo', color: '#3b82f6' },
  { id: 'sad', emoji: '😢', label: 'Triste', color: '#6366f1' },
  { id: 'anxious', emoji: '😰', label: 'Ansioso', color: '#ec4899' },
  { id: 'angry', emoji: '😠', label: 'Irritado', color: '#ef4444' },
  { id: 'tired', emoji: '😴', label: 'Cansado', color: '#8b5cf6' },
  { id: 'grateful', emoji: '🙏', label: 'Grato', color: '#14b8a6' },
];

export function getMoodById(id) {
  return MOODS.find(mood => mood.id === id);
}

export function getAllMoods() {
  return MOODS;
}

function MoodSelector({ selected, onSelect, compact = false }) {
  return (
    <div className={`mood-selector ${compact ? 'compact' : ''}`}>
      {!compact && <span className="mood-label">Como você está se sentindo?</span>}
      <div className="mood-options">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            className={`mood-option ${selected === mood.id ? 'selected' : ''}`}
            onClick={() => onSelect(selected === mood.id ? null : mood.id)}
            title={mood.label}
            style={{
              '--mood-color': mood.color,
            }}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            {!compact && <span className="mood-text">{mood.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodSelector;
