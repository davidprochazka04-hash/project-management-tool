"use strict";
const Ajv = require("ajv").default;
const ajv = new Ajv({ allErrors: true }); 

// --- DAO Imports ---
const PhaseDao = require("../../dao/phase-dao"); 
const phaseDaoInstance = new PhaseDao(); 

// Importujeme ProjectDao, abychom mohli aktualizovat názvy fází u projektů
const ProjectDao = require("../../dao/project-dao");
const projectDaoInstance = new ProjectDao();

// ------------------------------------------------------------------
// SCHEMA PRO VALIDACI DAT K AKTUALIZACI
// ------------------------------------------------------------------
const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" }
  },
  required: [],
  additionalProperties: false
};

// ------------------------------------------------------------------
// HLAVNÍ ABL FUNKCE
// ------------------------------------------------------------------
async function UpdateAbl(req, res) {
    try {
        const phaseId = req.params.id;     
        const newPhaseData = req.body;     
        
        if (!phaseId || Object.keys(newPhaseData).length === 0) {
            return res.status(400).send({
                success: false,
                errorMessage: "Invalid input: Must provide valid ID in URL and non-empty data in body for update."
            });
        }
        
        const valid = ajv.validate(schema, newPhaseData);
        if (!valid) {
            return res.status(400).send({
                success: false,
                errorMessage: "Validation of update data failed",
                params: newPhaseData,
                reason: ajv.errors
            });
        }

        if (newPhaseData.name) {
            const phaseList = await phaseDaoInstance.listPhases();
            const existingPhase = phaseList.find(
                p => p.name.toLowerCase() === newPhaseData.name.toLowerCase() && p.id !== phaseId
            );

            if (existingPhase) {
                return res.status(400).send({
                    success: false,
                    errorMessage: `Phase update failed. The name '${newPhaseData.name}' is already used by another phase.`
                });
            }
        }
        
        // 1. Aktualizace samotné fáze
        const updatedPhase = await phaseDaoInstance.updatePhase(phaseId, newPhaseData); 
        
        if (!updatedPhase) {
            return res.status(404).send({ 
                success: false,
                error: `Phase with ID '${phaseId}' not found for update.` 
            });
        }

        // 2. 🔥 SYNCHRONIZACE: Pokud se změnil název, aktualizujeme projekty
        if (newPhaseData.name) {
            const allProjects = await projectDaoInstance.listProjects();
            
            // Najdeme projekty, které mají stejné phaseId
            const projectsToUpdate = allProjects.filter(p => p.phaseId === phaseId);

            // Pro každý projekt provedeme update pole phaseName
            for (const project of projectsToUpdate) {
                await projectDaoInstance.updateProject(project.id, {
                    phaseName: updatedPhase.name
                });
            }
            console.log(`Synchronizováno: Název fáze aktualizován u ${projectsToUpdate.length} projektů.`);
        }

        return res.json(updatedPhase); 

    } catch (err) {
        console.error("Error in UpdateAbl for Phase:", err);
        return res.status(500).send({ 
            success: false, 
            message: "Internal Server Error during phase update.", 
            details: err.message 
        });
    }
}

module.exports = UpdateAbl;