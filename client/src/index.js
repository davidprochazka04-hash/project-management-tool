import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ProjectProvider } from './context/ProjectContext';
import { PhaseProvider } from './context/PhaseContext'; // Přidán import

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Oba providery nyní poskytují data celé aplikaci */}
    <PhaseProvider>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </PhaseProvider>
  </React.StrictMode>
);

reportWebVitals();