const express = require('express');
const TableRouter = express.Router();
const tableController = require('../controllers/Table.controllers');

// Créer une nouvelle table
TableRouter.post('/create', tableController.createTable);

// Récupérer toutes les tables
TableRouter.get('/', tableController.getAllTables);

// Mettre à jour une table par son ID
TableRouter.put('/update/:id', tableController.updateTable);

// Supprimer une table par son ID
TableRouter.delete('/delete/:id', tableController.deleteTable);

module.exports = TableRouter;
