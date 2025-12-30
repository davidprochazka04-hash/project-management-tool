import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm'; 
import PhaseManagementModal from './PhaseManagementModal';
import ProjectStatusModal from './ProjectStatusModal';
import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  const fetchProjects = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:8000/project/list')
      .then((response) => {
        if (!response.ok) throw new Error('Nepodařilo se načíst data ze serveru');
        return response.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const fetchPhases = useCallback(() => {
    fetch('http://localhost:8000/phase/list')
      .then((response) => response.json())
      .then((data) => setPhases(data))
      .catch((err) => console.error("Chyba fází:", err));
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchPhases();
  }, [fetchProjects, fetchPhases]);

  const handleOpenCreateModal = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const handleProjectUpdated = () => {
    fetchProjects();
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm("Opravdu chcete tento projekt smazat?")) {
      fetch(`http://localhost:8000/project/delete/${projectId}`, {
        method: 'DELETE',
      })
      .then(res => {
        if (!res.ok) throw new Error('Smazání se nezdařilo');
        setProjects(prev => prev.filter(p => p.id !== projectId));
      })
      .catch(err => alert("Chyba: " + err.message));
    }
  };

  const handleClosePhaseModal = () => {
    setIsPhaseModalOpen(false);
    fetchProjects();
    fetchPhases();
  };

  return (
    <div className="dashboard-container">
      <Header 
        onOpenModal={handleOpenCreateModal} 
        onManagePhases={() => setIsPhaseModalOpen(true)} 
        onOpenStatus={() => setIsStatusModalOpen(true)}
      />
      
      {loading && projects.length === 0 && (
        <p style={{textAlign: 'center', color: '#888', marginTop: '50px'}}>Načítám projekty...</p>
      )}
      
      {error && <p style={{textAlign: 'center', color: '#ef4444', marginTop: '50px'}}>Chyba: {error}</p>}
      
      {!error && (
        <ProjectList 
          projects={projects} 
          onEdit={handleOpenEditModal} 
          onDelete={handleDeleteProject}
        />
      )}

      {isModalOpen && (
        <ProjectForm 
          editData={projectToEdit}
          onClose={() => setIsModalOpen(false)} 
          onProjectCreated={handleProjectCreated} 
          onProjectUpdated={handleProjectUpdated}
        />
      )}

      {isPhaseModalOpen && (
        <PhaseManagementModal 
          onClose={handleClosePhaseModal}
          onRefreshProjects={fetchProjects}
        />
      )}

      {isStatusModalOpen && (
        <ProjectStatusModal 
          projects={projects}
          phases={phases}
          onClose={() => setIsStatusModalOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;