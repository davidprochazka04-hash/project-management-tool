import React from 'react';
import { Edit2, X } from 'lucide-react';
import { useProjects } from './context/ProjectContext'; // Import hooku

const Project = ({ project, onEdit }) => {
  const { deleteProject } = useProjects(); // Načtení funkce pro smazání z contextu

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
      
      <div className="column actions">
        <button 
          className="btn-icon" 
          onClick={() => onEdit(project)} 
          title="Upravit projekt"
        >
          <Edit2 size={16} />
        </button>

        <button 
          className="btn-icon btn-delete-project" 
          onClick={() => deleteProject(project.id)} // Voláme funkci z contextu
          title="Smazat projekt"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Project;