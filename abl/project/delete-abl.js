"use strict";
const Ajv = require("ajv").default;
const ajv = new Ajv();
const ProjectDao = require("../../dao/project-dao"); 
const projectDaoInstance = new ProjectDao(); 

// ------------------------------------------------------------------
// SCHEMA PRO VALIDACI ID
// ------------------------------------------------------------------
// Očekáváme ID v parametrech routy
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
    // 1. Získání dat (ID) z route parametrů
    const body = req.params; // ID je v req.params.id
    
    // 2. Validace vstupu
    const valid = ajv.validate(schema, body);

    if (!valid) {
      // 3. Chyba 400: Selhání validace
      return res.status(400).send({
        success: false,
        errorMessage: "Validation of input failed",
        params: body,
        reason: ajv.errors
      });
    }

    // 4. Volání DAO pro smazání projektu
    const projectId = body.id;
    // DAO metoda deleteProject vrací true/false
    const deleted = await projectDaoInstance.deleteProject(projectId); 
    
    if (deleted) {
      // 5. Úspěch: Odpověď 204 (No Content) je standardní pro úspěšné smazání
      return res.status(204).send(); 
    } else {
      // 6. Chyba 404: Projekt nebyl nalezen k smazání
      return res.status(404).send({ 
        success: false,
        error: `Project with ID '${projectId}' doesn't exist` 
      });
    }

  } catch (err) {
    // 7. Chyba 500: Neočekávaná chyba (např. chyba zápisu souboru)
    console.error("Error in DeleteAbl for Project:", err);
    return res.status(500).send({ 
        success: false, 
        message: "Internal Server Error during project deletion.", 
        details: err.message 
    });
  }
}

module.exports = DeleteAbl;