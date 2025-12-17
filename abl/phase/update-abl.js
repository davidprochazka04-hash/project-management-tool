"use strict";
const Ajv = require("ajv").default;
// Povolíme allErrors, aby validátor vrátil všechny problémy
const ajv = new Ajv({ allErrors: true }); 
const PhaseDao = require("../../dao/phase-dao"); 
// Vytvoříme instanci DAO, která bude sdílena
const phaseDaoInstance = new PhaseDao(); 

// ------------------------------------------------------------------
// SCHEMA PRO VALIDACI DAT K AKTUALIZACI
// ------------------------------------------------------------------
const schema = {
  type: "object",
  // V těle požadujeme, aby se objevila alespoň jedna z těchto vlastností
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
        // 1. Získání dat
        const phaseId = req.params.id;     // ID fáze z route parametrů (URL)
        const newPhaseData = req.body;     // Data pro aktualizaci z těla
        
        // 2. Kontrola, zda máme ID a zda tělo není prázdné
        if (!phaseId || Object.keys(newPhaseData).length === 0) {
            return res.status(400).send({
                success: false,
                errorMessage: "Invalid input: Must provide valid ID in URL and non-empty data in body for update."
            });
        }
        
        // 3. Validace dat k aktualizaci
        const valid = ajv.validate(schema, newPhaseData);

        if (!valid) {
            return res.status(400).send({
                success: false,
                errorMessage: "Validation of update data failed",
                params: newPhaseData,
                reason: ajv.errors
            });
        }

        // 🔥 3.5. KONTROLA UNIKÁTNOSTI NÁZVU (POUZE pokud se název aktualizuje)
        if (newPhaseData.name) {
            const phaseList = await phaseDaoInstance.listPhases();
            
            // Hledáme fázi, která má stejný název (case-insensitive) A JINÉ ID
            const existingPhase = phaseList.find(
                p => p.name.toLowerCase() === newPhaseData.name.toLowerCase() && p.id !== phaseId
            );

            if (existingPhase) {
                // Duplicitní název nalezen u jiného záznamu -> Chyba 400
                return res.status(400).send({
                    success: false,
                    errorMessage: `Phase update failed. The name '${newPhaseData.name}' is already used by another phase.`
                });
            }
        }
        
        // 4. Volání DAO pro aktualizaci
        // DAO metoda updatePhase vrací aktualizovaný objekt nebo null, pokud ID nenajde.
        const updatedPhase = await phaseDaoInstance.updatePhase(phaseId, newPhaseData); 
        
        if (updatedPhase) {
            // 5. Úspěch: Vrácení aktualizované fáze
            return res.json(updatedPhase); 
        } else {
            // 6. Chyba 404: Fáze nebyla nalezena
            return res.status(404).send({ 
                success: false,
                error: `Phase with ID '${phaseId}' not found for update.` 
            });
        }

    } catch (err) {
        // 7. Chyba 500: Neočekávaná chyba (např. chyba zápisu souboru)
        console.error("Error in UpdateAbl for Phase:", err);
        return res.status(500).send({ 
            success: false, 
            message: "Internal Server Error during phase update.", 
            details: err.message 
        });
    }
}

module.exports = UpdateAbl;