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
async function GetAbl(req, res) {
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

    // 4. Volání DAO pro získání projektu podle ID
    const projectId = body.id;
    // ProjectDao by měl mít metodu getProject(id)
    const project = await projectDaoInstance.getProject(projectId); 
    
    if (project) {
      // 5. Úspěch: Vrácení nalezeného projektu
      return res.json(project);
    } else {
      // 6. Chyba 404: Projekt s daným ID nebyl nalezen
      return res.status(404).send({ 
        success: false,
        error: `Project with ID '${projectId}' doesn't exist` 
      });
    }

  } catch (err) {
    // 7. Chyba 500: Neočekávaná chyba (např. chyba čtení souboru)
    console.error("Error in GetAbl for Project:", err);
    return res.status(500).send({ 
        success: false, 
        message: "Internal Server Error during project read operation.", 
        details: err.message 
    });
  }
}

module.exports = GetAbl;