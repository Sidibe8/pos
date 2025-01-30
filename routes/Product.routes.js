const express = require('express');
const ProductRouter = express.Router();
const productController = require('../controllers/Product.controllers');
const upload = require('../config/multer');

// Créer un nouveau produit
ProductRouter.post('/create',upload.single('image'), productController.createProduct);

// Récupérer tous les produits
ProductRouter.get('/', productController.getAllProducts);

// Mettre à jour un produit par son ID
ProductRouter.put('/update/:id',upload.single('image'), productController.updateProduct);

// Supprimer un produit par son ID
ProductRouter.delete('/delete/:id', productController.deleteProduct);

module.exports = ProductRouter;
