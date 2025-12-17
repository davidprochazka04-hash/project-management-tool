"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Asynchronní verze funkcí pro práci se soubory
const rf = fs.promises.readFile;
const wf = fs.promises.writeFile;

// Cesta k JSON souboru pro ukládání dat Projektů
const DEFAULT_STORAGE_PATH = path.join(__dirname, "storage", "project.json");

class ProjectDao {
    constructor(storagePath) {
        this.projectStoragePath = storagePath
            ? storagePath
            : DEFAULT_STORAGE_PATH;
    }

    // Metoda pro získání cesty k úložišti
    _getStorageLocation() {
        return this.projectStoragePath;
    }

    // Pomocná metoda pro načtení všech projektů
    async _loadAllProjects() {
        let projectList;
        try {
            const fileData = await rf(this._getStorageLocation());
            projectList = JSON.parse(fileData);
        } catch (e) {
            // Pokud soubor neexistuje nebo je prázdný, vrátí se prázdné pole
            if (e.code === 'ENOENT') {
                projectList = [];
            } else {
                throw new Error("Failed to load project data: " + e.message);
            }
        }
        return projectList;
    }

    // --- CRUD OPERACE ---

    // Vytvoření nového projektu (CREATE)
    async createProject(project) {
        let projectList = await this._loadAllProjects();
        
        // Generování unikátního ID
        project.id = crypto.randomBytes(8).toString("hex"); 

        projectList.push(project);

        // Zápis aktualizovaného seznamu zpět do souboru
        await wf(this._getStorageLocation(), JSON.stringify(projectList, null, 2));

        return project;
    }
    
    // Získání celého seznamu projektů (READ ALL)
    async listProjects() {
        return await this._loadAllProjects();
    }

    // Získání jednoho projektu podle ID (READ ONE)
    async getProject(id) {
        const projectList = await this._loadAllProjects();
        
        const result = projectList.find(p => p.id === id);

        return result; 
    }
    
    // Aktualizace existujícího projektu (UPDATE)
    async updateProject(id, newData) {
        let projectList = await this._loadAllProjects();
        
        const projectIndex = projectList.findIndex(p => p.id === id);

        if (projectIndex === -1) {
            return null; // Není nalezen
        }
        
        const originalProject = projectList[projectIndex];
        const updatedProject = {
            ...originalProject, 
            ...newData,
        };

        projectList[projectIndex] = updatedProject;

        await wf(this._getStorageLocation(), JSON.stringify(projectList, null, 2));

        return updatedProject; 
    }

    // Smazání projektu (DELETE)
    async deleteProject(id) {
        let projectList = await this._loadAllProjects();
        
        const projectIndex = projectList.findIndex(p => p.id === id);

        if (projectIndex === -1) {
            return false; 
        }

        projectList.splice(projectIndex, 1);

        await wf(this._getStorageLocation(), JSON.stringify(projectList, null, 2));

        return true; 
    }
}

module.exports = ProjectDao;