"use strict";
// --- DAO Imports ---
const ProjectDao = require("../../dao/project-dao"); 
const projectDaoInstance = new ProjectDao(); 
const PhaseDao = require("../../dao/phase-dao"); 
const phaseDaoInstance = new PhaseDao(); 

// ------------------------------------------------------------------
// HLAVNÍ ABL FUNKCE
// ------------------------------------------------------------------
async function StatusAbl(req, res) {
  try {
    // 1. Načtení všech dat
    const projectList = await projectDaoInstance.listProjects(); // Pole projektů
    const phaseList = await phaseDaoInstance.listPhases();     // Pole fází
    
    // 2. Alternativní tok A1: V systému není žádný projekt
    if (!projectList || projectList.length === 0) {
      return res.status(200).send({
        success: true,
        message: "Pro status nejsou k dispozici žádná data."
      });
    }

    // 3. Agregace projektů podle fáze (group by phaseId)
    const aggregatedData = projectList.reduce((acc, project) => {
      const phaseId = project.phaseId || 'NO_PHASE_ID'; // Ošetření, kdyby chybělo phaseId

      if (!acc[phaseId]) {
        acc[phaseId] = {
          count: 0,
          projectNames: []
        };
      }
      
      acc[phaseId].count++;
      acc[phaseId].projectNames.push(project.name);
      
      return acc;
    }, {});
    
    // 4. Spojení (JOIN) s názvy fází a finální formátování
    const statusReport = [];
    
    for (const phaseId in aggregatedData) {
      // Nalezení celého objektu fáze pro získání jména
      const phase = phaseList.find(p => p.id === phaseId);
      
      // Sestavení finálního výstupu pro danou fázi
      statusReport.push({
        phaseId: phaseId,
        phaseName: phase ? phase.name : "Neznámá/Chybějící fáze",
        projectCount: aggregatedData[phaseId].count,
        projectNames: aggregatedData[phaseId].projectNames
      });
    }

    // 5. Odeslání výsledku (Happy day scénář 3)
    return res.json({
        success: true,
        report: statusReport
    });

  } catch (err) {
    // 6. Zpracování chyby
    console.error("Error in StatusAbl for Project Aggregation:", err);
    return res.status(500).send({ 
        success: false, 
        message: "Internal Server Error during status aggregation.", 
        details: err.message 
    });
  }
}

module.exports = StatusAbl;