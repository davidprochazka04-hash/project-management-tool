const express = require("express");
const router = express.Router();

// Import všech ABL funkcí určených pro entitu Projekt
const createProject = require("../abl/project/create-abl");
const updateProject = require("../abl/project/update-abl");
const listProjects = require("../abl/project/list-abl");
const getProject = require("../abl/project/get-abl");
const deleteProject = require("../abl/project/delete-abl");
const statusProject = require("../abl/project/status-abl");

// ------------------------------------------------------------------
// ROUTY PRO CRUD OPERACE (REST konvence)
// ------------------------------------------------------------------

/**
 * Vytvoření nového projektu (CREATE)
 * POST /project/create
 */
router.post('/create', async (req, res) => {
    // Tělo požadavku (req.body) by mělo obsahovat data projektu
    await createProject(req, res);
});

/**
 * Získání seznamu všech projektů (READ ALL)
 * GET /project/list
 */
router.get('/list', async (req, res) => {
    // Parametry pro filtrování, stránkování atd. jsou v req.query
    await listProjects(req, res);
});

/**
 * Získání detailu jednoho projektu podle ID (READ ONE)
 * GET /project/get/:id
 */

router.get('/get/:id', async (req, res) => { 
    // ID projektu je v req.params.id
    await getProject(req, res); 
});

/**
 * Úprava existujícího projektu (UPDATE)
 * PUT /project/update
 */
router.put('/update/:id', async (req, res) => {
    // Data pro úpravu a ID projektu v req.body
    await updateProject(req, res);
});


 /* Smazání projektu (DELETE)
 * DELETE /project/delete/:id
 */
router.delete('/delete/:id', async (req, res) => {
    // ID projektu pro smazání v req.params.id
    await deleteProject(req, res);
});
/**
 * Získání Agregovaného Přehledu Projektů (STATUS)
 * GET /project/status
 */
router.get('/status', async (req, res) => {
    // Požadavek na agregaci nevyžaduje žádné parametry
    await statusProject(req, res);
});

module.exports = router;