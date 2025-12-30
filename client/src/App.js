import React, { useState, useEffect } from 'react';
import Header from './Header';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm'; 
import PhaseManagementModal from './PhaseManagementModal';
import ProjectStatusModal from './ProjectStatusModal';
import { useProjects } from './context/ProjectContext';
import { usePhases } from './context/PhaseContext';
import './App.css';

function App() {
  const { projects, loading, error, fetchProjects } = useProjects();
  const { fetchPhases } = usePhases();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

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
      
      {!error && <ProjectList onEdit={handleOpenEditModal} />}

      {isModalOpen && (
        <ProjectForm editData={projectToEdit} onClose={() => setIsModalOpen(false)} />
      )}

      {isPhaseModalOpen && (
        <PhaseManagementModal onClose={() => setIsPhaseModalOpen(false)} />
      )}

      {isStatusModalOpen && (
        <ProjectStatusModal onClose={() => setIsStatusModalOpen(false)} />
      )}
    </div>
  );
}

export default App;