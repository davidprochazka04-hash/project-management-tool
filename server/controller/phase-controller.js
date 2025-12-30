const express = require("express");
const router = express.Router();

// Import všech ABL funkcí pro Fáze
const createPhase = require("../abl/phase/create-abl");
const getPhase = require("../abl/phase/get-abl");
const listPhases = require("../abl/phase/list-abl");
const deletePhase = require("../abl/phase/delete-abl");
const updatePhase = require("../abl/phase/update-abl");


// *** CRUD operace ***

// CREATE (POST)
router.post('/create', async (req, res) => {
    // Controller zavolá ABL a zpracuje výsledek/chybu
    await createPhase(req, res);
});

// READ (GET LIST)
router.get('/list', async (req, res) => {
    await listPhases(req, res); 
});

// READ (GET ONE - by ID)
router.get('/get/:id', async (req, res) => { 
    await getPhase(req, res); 
});

// UPDATE (PUT)
router.put('/update/:id', async (req, res) => {
    await updatePhase(req, res);
}); // <-- UZAVŘENÍ ROUTY PUT

// DELETE
router.delete('/delete/:id', async (req, res) => {
    await deletePhase(req, res);
}); // <-- UZAVŘENÍ ROUTY DELETE

module.exports = router; // <-- SPRÁVNÝ A POSLEDNÍ EXPORT