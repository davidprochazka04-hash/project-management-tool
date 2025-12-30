import React from 'react';
import { X } from 'lucide-react';

const ProjectStatusModal = ({ projects, phases, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card status-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Status</h2>
          <button className="close-x" onClick={onClose}><X /></button>
        </div>

        <div className="status-content">
          <h3 className="status-section-title">Fáze</h3>
          
          <div className="phase-groups-list">
            {phases.map(phase => {
              // Vyfiltrujeme projekty patřící do této fáze
              const projectsInPhase = projects.filter(p => p.phaseId === phase.id);
              
              return (
                <div key={phase.id} className="status-phase-group">
                  {/* Název fáze s počtem projektů */}
                  <div className="status-phase-header">
                    {phase.name} ({projectsInPhase.length})
                  </div>
                  
                  {/* Seznam projektů v dané fázi */}
                  <div className="status-project-list">
                    {projectsInPhase.length > 0 ? (
                      projectsInPhase.map(project => (
                        <div key={project.id} className="status-project-item">
                          {project.name}
                        </div>
                      ))
                    ) : (
                      <div className="status-no-projects">Žádné projekty</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={onClose}>Zpět</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusModal;