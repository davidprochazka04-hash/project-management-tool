"use strict";
const Ajv = require("ajv").default;
const ajv = new Ajv({ allErrors: true }); 
const addFormats = require("ajv-formats"); 
addFormats(ajv); 

// --- DAO Imports ---
const ProjectDao = require("../../dao/project-dao"); 
const projectDaoInstance = new ProjectDao(); 
// 🔥 NOVÝ IMPORT: PhaseDao pro kontrolu existence nové fáze
const PhaseDao = require("../../dao/phase-dao"); 
const phaseDaoInstance = new PhaseDao(); 

// ------------------------------------------------------------------
// SCHEMA PRO VALIDACI DAT K AKTUALIZACI PROJEKTU
// ------------------------------------------------------------------
const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    startDate: { type: "string", format: "date" }, 
    status: { type: "string" },
    // 🔥 Povolení aktualizace phaseId
    phaseId: { type: "string" } 
  },
  // Pro Update povolíme, aby se posílala jen podmnožina dat
  required: [], 
  additionalProperties: false
};

// ------------------------------------------------------------------
// HLAVNÍ ABL FUNKCE
// ------------------------------------------------------------------
async function UpdateAbl(req, res) {
  try {
    const projectId = req.params.id;     
    const newProjectData = req.body;     
    
    // 1. Základní kontrola
    if (!projectId || Object.keys(newProjectData).length === 0) {
      return res.status(400).send({
        success: false,
        errorMessage: "Invalid input: Must provide valid ID in URL and non-empty data in body for update."
      });
    }
    
    // 2. Validace dat k aktualizaci
    const valid = ajv.validate(schema, newProjectData);

    if (!valid) {
      return res.status(400).send({
        success: false,
        errorMessage: "Validation of update data failed",
        params: newProjectData,
        reason: ajv.errors
      });
    }
    
    // 🔥 3. BYZNYS KONTROLA: Ověření existence nové fáze
    if (newProjectData.phaseId) {
        // Zkusíme najít fázi s novým ID
        const targetPhase = await phaseDaoInstance.getPhase(newProjectData.phaseId);

        if (!targetPhase) {
            return res.status(404).send({ 
                success: false,
                error: `Phase with ID '${newProjectData.phaseId}' specified for assignment was not found.` 
            });
        }
        
        // 🔥 Zajištění denormalizace: Přidání jména fáze k aktualizovaným datům
        newProjectData.phaseName = targetPhase.name; 
    }

    // 4. Volání DAO pro aktualizaci
    const updatedProject = await projectDaoInstance.updateProject(projectId, newProjectData); 
    
    if (updatedProject) {
      // 5. Úspěch
      return res.json(updatedProject); 
    } else {
      // 6. Chyba 404
      return res.status(404).send({ 
        success: false,
        error: `Project with ID '${projectId}' not found for update.` 
      });
    }

  } catch (err) {
    // 7. Chyba 500
    console.error("Error in UpdateAbl for Project:", err);
    return res.status(500).send({ 
        success: false, 
        message: "Internal Server Error during project update.", 
        details: err.message 
    });
  }
}

module.exports = UpdateAbl;