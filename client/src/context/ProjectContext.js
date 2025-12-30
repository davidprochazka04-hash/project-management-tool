import React, { createContext, useState, useCallback, useContext } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:8000/project/list')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const createProject = async (projectData) => {
    try {
      const res = await fetch('http://localhost:8000/project/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      const data = await res.json();
      if (data.success === false) throw new Error(data.errorMessage);
      fetchProjects(); // Refresh seznamu
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const res = await fetch(`http://localhost:8000/project/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      const data = await res.json();
      if (data.success === false) throw new Error(data.errorMessage);
      fetchProjects(); // Refresh seznamu
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Opravdu chcete tento projekt smazat?")) return;
    try {
      const res = await fetch(`http://localhost:8000/project/delete/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Smazání selhalo');
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, loading, error, fetchProjects, createProject, updateProject, deleteProject 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);