const Ajv = require("ajv").default; // Používáme .default kvůli starším/různým verzím Ajv
const ajv = new Ajv();
const PhaseDao = require("../../dao/phase-dao"); // Předpokládaná relativní cesta z abl/phase
const phaseDaoInstance = new PhaseDao(); // Vytvoření jedné instance DAO

// ------------------------------------------------------------------
// SCHEMA PRO VALIDACI ID
// ------------------------------------------------------------------
// Očekává se ID fáze jako řetězec. ID je povinné.
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
    // 1. Získání dat (ID) z query parametrů (GET request) nebo těla
    const body = req.params; // Pro GET s parametry v URL (např. /get/:id)
    
    // 2. Validace vstupu
    const valid = ajv.validate(schema, body);

    if (valid) {
      // 3. Volání DAO pro získání fáze podle ID
      const phaseId = body.id;
      // Použijeme metodu getPhase, kterou jsme definovali v phase-dao.js
      const phase = await phaseDaoInstance.getPhase(phaseId); 
      
      if (phase) {
        // 4. Úspěch: Vrácení nalezené fáze
        return res.json(phase);
      } else {
        // 5. Chyba 404: Fáze s daným ID nebyla nalezena
        return res.status(404).send({ 
          success: false,
          error: `Phase with ID '${phaseId}' doesn't exist` 
        });
      }

    } else {
      // 6. Chyba 400: Selhání validace
      return res.status(400).send({
        success: false,
        errorMessage: "Validation of input failed",
        params: body,
        reason: ajv.errors
      });
    }

  } catch (err) {
    // 7. Chyba 500: Neočekávaná chyba (např. chyba čtení souboru)
    console.error("Error in GetAbl for Phase:", err);
    return res.status(500).send({ 
        success: false, 
        message: "Internal Server Error", 
        details: err.message 
    });
  }
}

module.exports = GetAbl;