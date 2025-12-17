"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto"); // pro generování ID  

// Asynchronní verze funkcí pro práci se soubory
const rf = fs.promises.readFile;
const wf = fs.promises.writeFile;

// Cesta k JSON souboru pro ukládání dat Fází
const DEFAULT_STORAGE_PATH = path.join(__dirname, "storage", "phase.json");

class PhaseDao {
    constructor(storagePath) {
        this.phaseStoragePath = storagePath
            ? storagePath
            : DEFAULT_STORAGE_PATH;
    }

    // Metoda pro získání cesty k úložišti
    _getStorageLocation() {
        return this.phaseStoragePath;
    }

    // Pomocná metoda pro načtení všech fází
    async _loadAllPhases() {
        let phaseList;
        try {
            // Přečtení JSON souboru a parsování
            const fileData = await rf(this._getStorageLocation());
            phaseList = JSON.parse(fileData);
        } catch (e) {
            // Pokud soubor neexistuje nebo je prázdný, vrátí se prázdné pole
            if (e.code === 'ENOENT') {
                phaseList = [];
            } else {
                throw new Error("Failed to load phase data: " + e.message);
            }
        }
        return phaseList;
    }

    // --- CRUD OPERACE ---

    // Vytvoření nové fáze (CREATE)
    async createPhase(phase) {
        let phaseList = await this._loadAllPhases();
        
        // Generování unikátního ID pro novou fázi
        phase.id = crypto.randomBytes(8).toString("hex"); 

        phaseList.push(phase);

        // Zápis aktualizovaného seznamu zpět do souboru
        await wf(this._getStorageLocation(), JSON.stringify(phaseList, null, 2));

        return phase;
    }
    
    // Získání celého seznamu fází (READ ALL)
    async listPhases() {
        return await this._loadAllPhases();
    }

    // Získání jedné fáze podle ID (READ ONE)
    async getPhase(id) {
        const phaseList = await this._loadAllPhases();
        
        // Hledání fáze
        const result = phaseList.find(p => p.id === id);

        return result; 
    }
    
    // Aktualizace existující fáze (UPDATE)
    async updatePhase(id, newData) {
        let phaseList = await this._loadAllPhases();
        
        // 1. Najdeme index fáze, kterou chceme aktualizovat
        const phaseIndex = phaseList.findIndex(p => p.id === id);

        if (phaseIndex === -1) {
            return null; // Není nalezena
        }
        
        // 2. Vytvoření aktualizovaného objektu (použijeme spread syntax pro přepsání dat)
        const originalPhase = phaseList[phaseIndex];
        const updatedPhase = {
            ...originalPhase, // Zachová původní data (ID, případně jiné vlastnosti)
            ...newData,       // Přepíše data z newData (name, description, atd.)
            // (volitelně) updatedAt: new Date()
        };

        // 3. Nahrazení starého objektu novým v seznamu
        phaseList[phaseIndex] = updatedPhase;

        // 4. Zápis upraveného seznamu zpět do souboru
        await wf(this._getStorageLocation(), JSON.stringify(phaseList, null, 2));

        return updatedPhase; 
    }

    // Metoda pro SMAZÁNÍ (DELETE)
    async deletePhase(id) {
        let phaseList = await this._loadAllPhases();
        
        // 1. Najdeme index fáze, kterou chceme smazat
        const phaseIndex = phaseList.findIndex(p => p.id === id);

        if (phaseIndex === -1) {
            // Fáze nebyla nalezena
            return false; 
        }

        // 2. Smazání fáze ze seznamu (pomocí splice)
        phaseList.splice(phaseIndex, 1);

        // 3. Zápis upraveného seznamu zpět do souboru
        await wf(this._getStorageLocation(), JSON.stringify(phaseList, null, 2));

        // 4. Vrácení true pro potvrzení smazání
        return true; 
    }
}

module.exports = PhaseDao;