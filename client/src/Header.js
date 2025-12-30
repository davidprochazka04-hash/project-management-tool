import React from 'react';
import { Plus, Settings, BarChart2 } from 'lucide-react';

/**
 * Komponenta Header
 * @param {Function} onOpenModal - otevře formulář projektu
 * @param {Function} onManagePhases - otevře správu fází
 * @param {Function} onOpenStatus - otevře přehled Status (agregace)
 */
const Header = ({ onOpenModal, onManagePhases, onOpenStatus }) => {
  return (
    <header className="dashboard-header">
      <h1>Přehled projektů</h1>
      
      <div className="header-buttons">
        {/*Přidán onClick={onOpenStatus} */}
        <button className="btn-secondary" onClick={onOpenStatus}>
          <BarChart2 size={18} /> Status
        </button>

        <button className="btn-secondary" onClick={onManagePhases}>
          <Settings size={18} /> Správa fází
        </button>

        <button className="btn-primary" onClick={onOpenModal}>
          <Plus size={18} /> Nový projekt
        </button>
      </div>
    </header>
  );
};

export default Header;