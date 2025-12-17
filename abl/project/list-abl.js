"use strict";
// Import DAO a instance
const ProjectDao = require("../../dao/project-dao"); 
const projectDaoInstance = new ProjectDao(); 

// ------------------------------------------------------------------
// HLAVNÍ ABL FUNKCE
// ------------------------------------------------------------------
async function ListAbl(req, res) {
  try {
    // 1. Získání dat
    // Zde je možné přidat logiku pro filtrování, stránkování nebo řazení,
    // ale pro základní implementaci jen zavoláme DAO metodu listProjects().
    
    // 2. Volání DAO pro získání seznamu
    // Metoda listProjects vrací celé pole projektů
    const projectList = await projectDaoInstance.listProjects();

    // 3. Odeslání úspěšné odpovědi (seznam projektů)
    return res.json(projectList); 

  } catch (err) {
    // 4. Zpracování chyby (např. chyba čtení souboru)
    console.error("Error in ListAbl for Project:", err);
    return res.status(500).send({ 
        success: false, 
        message: "Internal Server Error during project listing.", 
        details: err.message 
    });
  }
}

module.exports = ListAbl;