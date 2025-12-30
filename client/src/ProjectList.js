import React from 'react';
import Project from './Project';
import { useProjects } from './context/ProjectContext'; // Import hooku

const ProjectList = ({ onEdit }) => {
  const { projects } = useProjects(); // Načtení projektů přímo z contextu

  return (
    <div className="project-table">
      <div className="table-header">
        <div className="column">NÁZEV PROJEKTU</div>
        <div className="column">POPIS</div>
        <div className="column">FÁZE</div>
        <div className="column">AKCE</div>
      </div>
      <div className="table-body">
        {projects.map((project) => (
          <Project 
            key={project.id} 
            project={project} 
            onEdit={onEdit} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;