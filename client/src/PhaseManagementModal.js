import React, { useState, useEffect } from 'react';
import { Trash2, X, Plus, Check, Edit2 } from 'lucide-react';

// Přidána prop onRefreshProjects pro live aktualizaci hlavní tabulky
const PhaseManagementModal = ({ onClose, onRefreshProjects }) => {
  const [phases, setPhases] = useState([]);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const fetchPhases = () => {
    fetch('http://localhost:8000/phase/list')
      .then(res => res.json())
      .then(data => setPhases(data))
      .catch(err => console.error("Chyba při načítání fází:", err));
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const handleAddPhase = (e) => {
    e.preventDefault();
    if (!newPhaseName.trim()) return;
    fetch('http://localhost:8000/phase/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPhaseName, description: 'Ručně vytvořeno' })
    })
    .then(res => res.ok ? res.json() : res.json().then(err => { throw err }))
    .then(() => {
      setNewPhaseName('');
      fetchPhases();
      // Aktualizujeme seznam v App.js pro případ, že nová fáze ovlivní filtry/status
      if (onRefreshProjects) onRefreshProjects();
    })
    .catch(err => alert(err.errorMessage || "Chyba při vytváření."));
  };

  const startEdit = (phase) => {
    setEditingId(phase.id);
    setEditValue(phase.name);
  };

  const handleUpdatePhase = (id) => {
    if (!editValue.trim()) return;
    
    fetch(`http://localhost:8000/phase/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editValue })
    })
    .then(res => {
      if (!res.ok) return res.json().then(err => { throw err });
      return res.json();
    })
    .then(() => {
      setEditingId(null);
      fetchPhases();
      // KLÍČOVÝ BOD: Po úspěšné změně názvu fáze řekneme App.js, aby načetla čerstvá data projektů
      if (onRefreshProjects) onRefreshProjects();
    })
    .catch(err => alert(err.errorMessage || "Chyba při aktualizaci fáze."));
  };

  const handleDeletePhase = (id, name) => {
    if(window.confirm(`Opravdu smazat fázi "${name}"?`)) {
      fetch(`http://localhost:8000/phase/delete/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          fetchPhases();
          if (onRefreshProjects) onRefreshProjects();
        } else {
          return res.json().then(e => alert(e.errorMessage));
        }
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card phase-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Správa fází</h2>
          <button className="close-x" onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleAddPhase} className="phase-add-form">
          <input 
            value={newPhaseName} 
            onChange={e => setNewPhaseName(e.target.value)}
            placeholder="Název nové fáze..."
            required
          />
          <button type="submit" className="btn-primary"><Plus size={16}/> Přidat</button>
        </form>

        <div className="phase-list">
          {phases.map(phase => (
            <div key={phase.id} className="phase-item">
              {editingId === phase.id ? (
                <div className="edit-wrapper">
                  <input 
                    className="edit-input"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdatePhase(phase.id)}
                    autoFocus
                  />
                  <button className="btn-save-inline" onClick={() => handleUpdatePhase(phase.id)}>
                    <Check size={16} />
                  </button>
                  <button className="btn-cancel-inline" onClick={() => setEditingId(null)}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="phase-display-wrapper">
                  <span 
                    className="phase-name-text" 
                    onClick={() => startEdit(phase)}
                    style={{ cursor: 'pointer', flex: 1 }}
                    title="Klikněte pro úpravu názvu"
                  >
                    {phase.name}
                  </span>
                  
                  <div className="phase-actions-inline">
                    <button className="btn-action-small" onClick={() => startEdit(phase)} title="Upravit">
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="btn-action-small delete" 
                      onClick={() => handleDeletePhase(phase.id, phase.name)} 
                      title="Smazat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhaseManagementModal;