import React from 'react';
import { Edit2, X } from 'lucide-react'; // Přidán import křížku

const Project = ({ project, onEdit, onDelete }) => {
  return (
    <div className="project-row">
      <div className="column name">
        <strong>{project.name}</strong>
      </div>
      <div className="column description">
        {project.description}
      </div>
      <div className="column phase">
        <span className="phase-badge">{project.phaseName || "Idea"}</span>
      </div>
      
      {/* Sekce akcí se dvěma tlačítky */}
      <div className="column actions">
        <button 
          className="btn-icon" 
          onClick={() => onEdit(project)} 
          title="Upravit projekt"
        >
          <Edit2 size={16} />
        </button>

        {/* Nové tlačítko pro smazání projektu */}
        <button 
          className="btn-icon btn-delete-project" 
          onClick={() => onDelete(project.id)} 
          title="Smazat projekt"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Project;