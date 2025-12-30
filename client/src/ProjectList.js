import React from 'react';
import Project from './Project';

const ProjectList = ({ projects, onEdit, onDelete }) => {
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
            onDelete={onDelete} // Předáváme funkci dál
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;