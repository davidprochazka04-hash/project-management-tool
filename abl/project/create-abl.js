"use strict";
const Ajv = require("ajv").default;
const ajv = new Ajv({ allErrors: true });
const addFormats = require("ajv-formats");
addFormats(ajv);

// --- DAO Imports ---
const ProjectDao = require("../../dao/project-dao"); 
const projectDaoInstance = new ProjectDao(); 
const PhaseDao = require("../../dao/phase-dao"); 
const phaseDaoInstance = new PhaseDao(); 

// --- Konstanty ---
const DEFAULT_PHASE_NAME = "Idea"; 

// ------------------------------------------------------------------
// POMOCNÁ FUNKCE: ZAJIŠTĚNÍ EXISTENCE DEFAULTNÍ FÁZE
// ------------------------------------------------------------------
async function ensureDefaultPhaseExists() {
    // 1. Zkusíme najít fázi
    const phaseList = await phaseDaoInstance.listPhases();
    let defaultPhase = phaseList.find(p => p.name === DEFAULT_PHASE_NAME);

    if (!defaultPhase) {
        // 2. Pokud neexistuje, vytvoříme ji
        console.log(`Defaultní fáze '${DEFAULT_PHASE_NAME}' nebyla nalezena. Vytvářím ji.`);
        
        const newPhaseData = {
            name: DEFAULT_PHASE_NAME,
            description: `Automaticky vytvořená výchozí fáze pro nové projekty.`,
        };
        
        defaultPhase = await phaseDaoInstance.createPhase(newPhaseData);
    }
    
    // 3. Vrátíme nalezenou / vytvořenou fázi
    return defaultPhase;
}

// ------------------------------------------------------------------
// SCHEMA PRO VALIDACI DAT PROJEKTU
// ------------------------------------------------------------------
const schema = {
  type: "object",
  properties: {
    name: { 
        type: "string",
        minLength: 1 // 🔥 ZACHOVÁNO: Zakazuje prázdný řetězec pro název
    },
    description: { 
        type: "string" // 🔥 UPRAVENO: Povoluje prázdný řetězec ("")
    },
    startDate: { type: "string", format: "date" },
  },
  required: ["name"],
  additionalProperties: false
};

// ------------------------------------------------------------------
// HLAVNÍ ABL FUNKCE
// ------------------------------------------------------------------
async function CreateAbl(req, res) {
  try {
    const projectData = req.body;
    
    // 1. Validace vstupu
    const valid = ajv.validate(schema, projectData);

    if (!valid) {
      return res.status(400).send({
        success: false,
        errorMessage: "Validation of input failed",
        params: projectData,
        reason: ajv.errors
      });
    }
    
    // 🔥 KONTROLA UNIKÁTNOSTI NÁZVU PROJEKTU
    const projectList = await projectDaoInstance.listProjects();
    const existingProject = projectList.find(
        // Porovnáváme s ignorováním velikosti písmen
        p => p.name.toLowerCase() === projectData.name.toLowerCase()
    );

    if (existingProject) {
        // Duplicita nalezena -> Chyba 400
        return res.status(400).send({
            success: false,
            errorMessage: `Project with name '${projectData.name}' already exists. Project names must be unique.`
        });
    }

    // 2. Zajištění existence a nalezení ID defaultní Fáze ("Idea")
    const defaultPhase = await ensureDefaultPhaseExists(); 
    
    // 3. Aplikace byznysové logiky a přidání phaseId + phaseName
    const newProject = {
        ...projectData,
        phaseId: defaultPhase.id,    
        phaseName: defaultPhase.name,  
    };
    
    // 4. Volání DAO pro vytvoření záznamu
    const createdProject = await projectDaoInstance.createProject(newProject);

    // 5. Odeslání úspěšné odpovědi 201 Created
    return res.status(201).json(createdProject); 

  } catch (err) {
    // 6. Zpracování chyby
    console.error("Error in CreateAbl for Project:", err);
    return res.status(500).send({ 
        success: false, 
        message: "Internal Server Error during project creation.", 
        details: err.message 
    });
  }
}

module.exports = CreateAbl;