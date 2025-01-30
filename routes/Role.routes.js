const express = require('express');
const role = express.Router();
const roleController = require('../controllers/Role.controllers');

// Créer un nouveau rôle
role.post('/create', roleController.createRole);

// Récupérer tous les rôles
role.get('/', roleController.getAllRoles);

// Mettre à jour un rôle par son ID
role.put('/update/:id', roleController.updateRole);

// Supprimer un rôle par son ID
role.delete('/delete/:id', roleController.deleteRole);

module.exports = role;
