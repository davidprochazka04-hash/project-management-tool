import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProjectForm = ({ editData, onClose, onProjectCreated, onProjectUpdated }) => {
  const [name, setName] = useState(editData ? editData.name : '');
  const [description, setDescription] = useState(editData ? editData.description : '');
  const [phaseId, setPhaseId] = useState(editData ? String(editData.phaseId) : '');
  const [phases, setPhases] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/phase/list')
      .then(res => res.json())
      .then(data => {
        setPhases(data);
        if (!editData && data.length > 0) {
          const ideaPhase = data.find(p => p.name === "Idea");
          if (ideaPhase) setPhaseId(String(ideaPhase.id));
          else setPhaseId(String(data[0].id));
        }
      })
      .catch(err => console.error("Chyba při načítání fází:", err));
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Příprava dat podle toho, zda tvoříme nebo upravujeme
    // Server při CREATE (POST) zakazuje phaseId a phaseName
    let projectData;
    let url;
    let method;

    if (editData) {
      // Data pro UPDATE 
      url = `http://localhost:8000/project/update/${editData.id}`;
      method = 'PUT';
      const selectedPhase = phases.find(p => String(p.id) === String(phaseId));
      projectData = {
        name: name,
        description: description || "",
        phaseId: String(phaseId),
        phaseName: selectedPhase ? selectedPhase.name : ""
      };
    } else {
      // Data pro CREATE 
      url = 'http://localhost:8000/project/create';
      method = 'POST';
      projectData = {
        name: name,
        description: description || ""
      };
    }
    
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success === false) {
        alert("Chyba serveru: " + data.errorMessage);
        return;
      }
      
      if (editData) {
        onProjectUpdated();
      } else {
        onProjectCreated();
      }
      onClose();
    })
    .catch(err => alert("Chyba při ukládání: " + err.message));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card project-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editData ? 'Upravit projekt' : 'Nový projekt'}</h2>
          <button className="close-x" onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <label>Název projektu</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Zadejte název..."
              required 
            />
          </div>

          <div className="input-group">
            <label>Popis</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Zadejte stručný popis..."
              rows="4"
            />
          </div>

          <div className="input-group">
            <label>Fáze projektu</label>
            {editData ? (
              <select 
                className="phase-select"
                value={phaseId} 
                onChange={e => setPhaseId(e.target.value)}
                required
              >
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
            ) : (
              <input 
                type="text"
                value="Idea"
                readOnly
                style={{ backgroundColor: '#0f172a', color: '#94a3b8', cursor: 'not-allowed', border: '1px solid #334155' }}
              />
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-danger" onClick={onClose}>Zrušit</button>
            <button type="submit" className="btn-primary">
              {editData ? 'Uložit změny' : 'Vytvořit projekt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;