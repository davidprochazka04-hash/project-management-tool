"use strict";
// Import datové vrstvy (DAO)
const PhaseDao = require("../../dao/phase-dao"); 

// Vytvoření instance DAO, která bude sdílena
const phaseDaoInstance = new PhaseDao();

/**
 * Získá a vrátí seznam všech fází.
 * @param {object} req Objekt požadavku (zde se nepoužívá tělo ani parametry).
 * @param {object} res Objekt odpovědi.
 */
async function ListAbl(req, res) {
    try {
        // 1. Zavolání DAO pro načtení všech fází
        // Předpokládáme, že PhaseDao obsahuje metodu listPhases (podobně jako listCategories)
        const phaseList = await phaseDaoInstance.listPhases();

        // 2. Odeslání seznamu klientovi
        return res.json(phaseList);

    } catch (e) {
        // 3. Zpracování chyby (např. chyba čtení souboru, chyba DB připojení)
        console.error("Error in ListAbl for Phase:", e);
        
        // Odeslání chybové odpovědi 500
        return res.status(500).send({
            success: false,
            message: "Internal Server Error during phase listing.",
            details: e.message 
        });
    }
}

module.exports = ListAbl;