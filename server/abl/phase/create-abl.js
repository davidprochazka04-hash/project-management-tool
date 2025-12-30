"use strict";
const Ajv = require("ajv").default; // Používáme .default pro Ajv v novějších verzích
const ajv = new Ajv({ allErrors: true }); 
const PhaseDao = require("../../dao/phase-dao");

// *** ZDE JE NEJLEPŠÍ MÍSTO PRO VYTVOŘENÍ INSTANCE DAO ***
const phaseDaoInstance = new PhaseDao(); 

const schema = {
  type: "object",
  properties: {
    name: {
        type: "string",
        minLength: 1 // Zakazuje prázdný řetězec pro název
    },
    description: {
        type: "string" //  Povoluje prázdný řetězec (""), protože je nepovinné
    }
  },
  required: ["name"],
  additionalProperties: false
};

async function CreateAbl(req, res) {
    try {
        const phaseData = req.body;
        const valid = ajv.validate(schema, phaseData);
    
        if (!valid) {
            // Zpracování chyby validace
            return res.status(400).send({ 
                success: false,
                errorMessage: "Validation of input failed",
                params: phaseData,
                reason: ajv.errors
            });
        }

        // KONTROLA UNIKÁTNOSTI NÁZVU
        const phaseList = await phaseDaoInstance.listPhases();
        const existingPhase = phaseList.find(
            // Porovnáváme s ignorováním velikosti písmen (case-insensitive)
            p => p.name.toLowerCase() === phaseData.name.toLowerCase()
        );

        if (existingPhase) {
            // Duplicita nalezena -> Chyba 400
            return res.status(400).send({
                success: false,
                errorMessage: `Phase with name '${phaseData.name}' already exists. Phase names must be unique.`
            });
        }
        
        // --- POKRAČOVÁNÍ VYTVAŘENÍ (pokud je název unikátní) ---
        
        // 1. Zavoláme metodu createPhase na INSTANCI
        const createdPhase = await phaseDaoInstance.createPhase(phaseData);
        
        // 2. Odeslání úspěšné odpovědi
        return res.status(201).json(createdPhase); 

    } catch (err) {
        // Zpracování chyb z DAO (např. chyba zápisu na disk)
        console.error("Chyba v ABL vrstvě:", err);
        // Odeslání chybové zprávy 500
        return res.status(500).send({ 
            success: false, 
            message: "Internal Server Error during phase creation.",
            details: err.message 
        });
    }
}

module.exports = CreateAbl;