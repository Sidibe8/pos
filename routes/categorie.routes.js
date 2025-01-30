const express = require('express');
const CategorieRouter = express.Router();
const categorieController = require('../controllers/Categorie.controllers');

// Créer une nouvelle catégorie
CategorieRouter.post('/create', categorieController.createCategorie);

// Récupérer toutes les catégories
CategorieRouter.get('/', categorieController.getAllCategories);

// Mettre à jour une catégorie par son ID
CategorieRouter.put('/update/:id', categorieController.updateCategorie);

// Supprimer une catégorie par son ID
CategorieRouter.delete('/delete/:id', categorieController.deleteCategorie);

module.exports = CategorieRouter;
