import React, { createContext, useState, useCallback, useContext } from 'react';

const PhaseContext = createContext();

export const PhaseProvider = ({ children }) => {
  const [phases, setPhases] = useState([]);
  const [loadingPhases, setLoadingPhases] = useState(false);

  const fetchPhases = useCallback(async () => {
    setLoadingPhases(true);
    try {
      const res = await fetch('http://localhost:8000/phase/list');
      const data = await res.json();
      setPhases(data);
    } catch (err) {
      console.error("Chyba při načítání fází:", err);
    } finally {
      setLoadingPhases(false);
    }
  }, []);

  const createPhase = async (phaseName) => {
    try {
      const res = await fetch('http://localhost:8000/phase/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: phaseName }),
      });
      const data = await res.json();
      if (data.success === false) throw new Error(data.errorMessage);
      await fetchPhases();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updatePhase = async (id, newName) => {
    try {
      const res = await fetch(`http://localhost:8000/phase/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (data.success === false) throw new Error(data.errorMessage);
      await fetchPhases();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deletePhase = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/phase/delete/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Smazání fáze selhalo');
      setPhases(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <PhaseContext.Provider value={{ 
      phases, loadingPhases, fetchPhases, createPhase, updatePhase, deletePhase 
    }}>
      {children}
    </PhaseContext.Provider>
  );
};

export const usePhases = () => useContext(PhaseContext);