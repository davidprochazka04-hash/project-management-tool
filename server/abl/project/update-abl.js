"use strict";
const Ajv = require("ajv").default;
const ajv = new Ajv({ allErrors: true }); 
const addFormats = require("ajv-formats"); 
addFormats(ajv); 

const ProjectDao = require("../../dao/project-dao"); 
const projectDaoInstance = new ProjectDao(); 
const PhaseDao = require("../../dao/phase-dao"); 
const phaseDaoInstance = new PhaseDao(); 

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    startDate: { type: "string", format: "date" }, 
    status: { type: "string" },
    phaseId: { type: "string" },
    phaseName: { type: "string" } 
  },
  required: [], 
  additionalProperties: false
};

async function UpdateAbl(req, res) {
  try {
    const projectId = req.params.id;     
    const newProjectData = req.body;     
    
    if (!projectId || Object.keys(newProjectData).length === 0) {
      return res.status(400).send({
        success: false,
        errorMessage: "Invalid input: Must provide valid ID in URL and non-empty data in body for update."
      });
    }
    
    const valid = ajv.validate(schema, newProjectData);
    if (!valid) {
      return res.status(400).send({
        success: false,
        errorMessage: "Validation of update data failed",
        params: newProjectData,
        reason: ajv.errors
      });
    }
    
    
    if (newProjectData.phaseName) {
        const phaseList = await phaseDaoInstance.listPhases();
        // Zkusí najít existující fázi podle názvu
        let targetPhase = phaseList.find(
            p => p.name.toLowerCase() === newProjectData.phaseName.toLowerCase()
        );

        // Pokud fáze neexistuje, vytvoří ji
        if (!targetPhase) {
            targetPhase = await phaseDaoInstance.createPhase({ 
                name: newProjectData.phaseName,
                description: `Automaticky vytvořeno při aktualizaci projektu.`
            });
        }

        // Propojí projekt s fází (uloží ID i jméno pro denormalizaci)
        newProjectData.phaseId = targetPhase.id;
        newProjectData.phaseName = targetPhase.name; 
    }

    const updatedProject = await projectDaoInstance.updateProject(projectId, newProjectData); 
    
    if (updatedProject) {
      return res.json(updatedProject); 
    } else {
      return res.status(404).send({ 
        success: false,
        error: `Project with ID '${projectId}' not found for update.` 
      });
    }

  } catch (err) {
    console.error("Error in UpdateAbl for Project:", err);
    return res.status(500).send({ 
        success: false, 
        message: "Internal Server Error during project update.", 
        details: err.message 
    });
  }
}

module.exports = UpdateAbl;