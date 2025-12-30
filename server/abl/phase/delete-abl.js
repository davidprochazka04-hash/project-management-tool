"use strict";
const Ajv = require("ajv").default;
const ajv = new Ajv();

// --- DAO Imports ---
const PhaseDao = require("../../dao/phase-dao"); 
const phaseDaoInstance = new PhaseDao(); 
// ProjectDao pro kontrolu integrity
const ProjectDao = require("../../dao/project-dao"); 
const projectDaoInstance = new ProjectDao(); 

// ------------------------------------------------------------------
// SCHEMA PRO VALIDACI ID
// ------------------------------------------------------------------
const schema = {
  type: "object",
  properties: {
    id: { type: "string" }
  },
  required: ["id"],
  additionalProperties: false
};

// ------------------------------------------------------------------
// HLAVNÍ ABL FUNKCE
// ------------------------------------------------------------------
async function DeleteAbl(req, res) {
  try {
    const body = req.params;
    
    // 1. Validace vstupu (ID fáze)
    const valid = ajv.validate(schema, body);

    if (!valid) {
      return res.status(400).send({
        success: false,
        errorMessage: "Validation of input failed",
        params: body,
        reason: ajv.errors
      });
    }
    
    const phaseIdToDelete = body.id;
    
    // 2. KONTROLA INTEGRITY: Zda fáze není přiřazena k žádnému projektu
    const projectList = await projectDaoInstance.listProjects();
    const hasProjects = projectList.some(p => p.phaseId === phaseIdToDelete);

    if (hasProjects) {
        // 3. BLOKOVÁNÍ SMAZÁNÍ: Pokud jsou nalezeny přiřazené projekty
        console.log(`Blokování smazání: Fáze ${phaseIdToDelete} je stále přiřazena k projektům.`);
        
        return res.status(400).send({
            success: false,
            errorMessage: "Cannot delete this phase. It is currently assigned to one or more projects."
        });
    }

    // 4. SMAZÁNÍ FÁZE (pouze pokud kontrola projde)
    const deleted = await phaseDaoInstance.deletePhase(phaseIdToDelete); 
    
    if (deleted) {
      // 5. Úspěch
      return res.status(204).send(); 
    } else {
      // 6. Chyba 404: Fáze nebyla nalezena
      return res.status(404).send({ 
        success: false,
        error: `Phase with ID '${phaseIdToDelete}' doesn't exist` 
      });
    }

  } catch (err) {
    // 7. Chyba 500
    console.error("Error in DeleteAbl for Phase:", err);
    return res.status(500).send({ 
        success: false, 
        message: "Internal Server Error during phase deletion.", 
        details: err.message 
    });
  }
}

module.exports = DeleteAbl;