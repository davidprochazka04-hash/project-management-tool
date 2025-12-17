const express = require("express");
const port = 3000;
const app = express();
/*const cors = require("cors");
const config = require("./config/server-config"); // Předpokládaná konfigurace (port, db info)
const connectDB = require("./dao/db-connection"); // Funkce pro připojení k DB
*/
// Import kontrolerů (routování)
const phaseController = require("./controller/phase-controller");
const projectController = require("./controller/project-controller");

// Inicializace Express aplikace


// ------------------------------------------------------------------
// MIDDLWARE
// ------------------------------------------------------------------

// Povolení CORS pro komunikaci s front-endem


// Middleware pro parsování JSON požadavků (req.body)
app.use(express.json());

// ------------------------------------------------------------------
// ZÁKLADNÍ ROUTY (zdravotní kontrola)
// ------------------------------------------------------------------

app.get('/', (req, res) => {
    res.send('Server je v provozu! Verze 1.0');
});

// ------------------------------------------------------------------
// PŘIPOJENÍ CONTROLLERŮ (Hlavní API routy)
// ------------------------------------------------------------------

// Všechny routy v 'phase-controller.js' budou dostupné pod /phase
app.use("/phase", phaseController); 

// Všechny routy v 'project-controller.js' budou dostupné pod /project
app.use("/project", projectController); 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
