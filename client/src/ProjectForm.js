import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProjects } from './context/ProjectContext';
import { usePhases } from './context/PhaseContext'; // Import hooku pro fáze

const ProjectForm = ({ editData, onClose }) => {
  const { createProject, updateProject } = useProjects();
  const { phases } = usePhases(); // Fáze bereme přímo z contextu
  
  const [name, setName] = useState(editData ? editData.name : '');
  const [description, setDescription] = useState(editData ? editData.description : '');
  const [phaseId, setPhaseId] = useState(editData ? String(editData.phaseId) : '');

  // Nastavení výchozí fáze "Idea" pouze při prvním načtení u nového projektu
  useEffect(() => {
    if (!editData && phases.length > 0 && !phaseId) {
      const ideaPhase = phases.find(p => p.name === "Idea");
      if (ideaPhase) setPhaseId(String(ideaPhase.id));
      else setPhaseId(String(phases[0].id));
    }
  }, [editData, phases, phaseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;

    if (editData) {
      const selectedPhase = phases.find(p => String(p.id) === String(phaseId));
      const projectData = {
        name,
        description: description || "",
        phaseId: String(phaseId),
        phaseName: selectedPhase ? selectedPhase.name : ""
      };
      result = await updateProject(editData.id, projectData);
    } else {
      result = await createProject({ name, description: description || "" });
    }

    if (result.success) onClose();
    else alert("Chyba: " + result.error);
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
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Zadejte název..." required />
          </div>

          <div className="input-group">
            <label>Popis</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Zadejte stručný popis..." rows="4" />
          </div>

          <div className="input-group">
            <label>Fáze projektu</label>
            {editData ? (
              <select className="phase-select" value={phaseId} onChange={e => setPhaseId(e.target.value)} required>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
            ) : (
              <input type="text" value="Idea" readOnly style={{ backgroundColor: '#0f172a', color: '#94a3b8', cursor: 'not-allowed', border: '1px solid #334155' }} />
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