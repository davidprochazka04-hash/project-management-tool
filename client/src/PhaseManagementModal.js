import React, { useState } from 'react';
import { Trash2, X, Plus, Check, Edit2 } from 'lucide-react';
import { usePhases } from './context/PhaseContext';
import { useProjects } from './context/ProjectContext';

const PhaseManagementModal = ({ onClose }) => {
  // Načtení dat a funkcí z PhaseContext
  const { phases, createPhase, updatePhase, deletePhase } = usePhases();
  // Načtení fetchProjects pro aktualizaci hlavní tabulky po změně fází
  const { fetchProjects } = useProjects();

  const [newPhaseName, setNewPhaseName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAddPhase = async (e) => {
    e.preventDefault();
    if (!newPhaseName.trim()) return;

    const result = await createPhase(newPhaseName);
    if (result.success) {
      setNewPhaseName('');
      fetchProjects(); // Aktualizace projektů, kdyby nová fáze ovlivnila UI
    } else {
      alert(result.error);
    }
  };

  const startEdit = (phase) => {
    setEditingId(phase.id);
    setEditValue(phase.name);
  };

  const handleUpdatePhase = async (id) => {
    if (!editValue.trim()) return;

    const result = await updatePhase(id, editValue);
    if (result.success) {
      setEditingId(null);
      fetchProjects(); // Změna názvu fáze se musí projevit v tabulce projektů
    } else {
      alert(result.error);
    }
  };

  const handleDeletePhase = async (id, name) => {
    if (window.confirm(`Opravdu smazat fázi "${name}"?`)) {
      const result = await deletePhase(id);
      if (result.success) {
        fetchProjects(); // Refresh projektů po smazání fáze
      } else {
        alert(result.error);
      }
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
          <button type="submit" className="btn-primary">
            <Plus size={16}/> Přidat
          </button>
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