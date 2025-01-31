const express = require('express');
const router = express.Router();
const Commande = require('../models/Commande.model');
const Product = require('../models/Product.model');
const mongoose = require('mongoose');

// *** CREATE ***
router.post('/', async (req, res) => {
  try {
    const { products, user, cashGiven, changeToGive } = req.body;

    // Vérifier que les champs requis sont présents
    if (!user || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Données manquantes ou invalides dans la requête.' });
    }

    let total_price = 0;
    for (const item of products) {
      // Vérifier que le produit et la quantité sont valides
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: 'Produit ou quantité invalide.' });
      }

      // Vérifier que le produit existe
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `ID de produit invalide : ${item.product}` });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Produit non trouvé pour l'ID : ${item.product}` });
      }

      total_price += item.price * item.quantity; // Calculer le prix total
    }

    // Créer la commande
    const newCommande = new Commande({
      products,
      user,
      total_price,
      cash_given: parseFloat(cashGiven),
      change_to_give: changeToGive,
      status: 'payée', // Statut par défaut
    });

    await newCommande.save();
    res.status(201).json({ message: 'Commande créée avec succès', commande: newCommande });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la commande', error: error.message });
  }
});

// *** READ - Get All Commandes ***
router.get('/', async (req, res) => {
  try {
    const commandes = await Commande.find().populate('products.product').populate('user');
    res.status(200).json(commandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error: error.message });
  }
});

// *** READ - Get Commande by ID ***
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de commande invalide.' });
    }

    const commande = await Commande.findById(id).populate('products.product').populate('user');

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    res.status(200).json(commande);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la commande', error: error.message });
  }
});

// *** UPDATE - Modifier une commande (inclut le statut) ***
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, products, cash_given, change_to_give } = req.body;

    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de commande invalide.' });
    }

    const commande = await Commande.findById(id);

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    // Mettre à jour les produits si fournis
    if (products) {
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: 'Liste de produits invalide.' });
      }

      let total_price = 0;
      for (const item of products) {
        // Vérifier que le produit et la quantité sont valides
        if (!item.product || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ message: 'Produit ou quantité invalide.' });
        }

        // Vérifier que le produit existe
        if (!mongoose.Types.ObjectId.isValid(item.product)) {
          return res.status(400).json({ message: `ID de produit invalide : ${item.product}` });
        }

        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Produit non trouvé pour l'ID : ${item.product}` });
        }

        total_price += item.price * item.quantity; // Calculer le prix total
      }

      commande.products = products;
      commande.total_price = total_price;
    }

    // Mettre à jour le statut si fourni
    if (status) {
      const validStatuses = ['en_attente', 'en_cours', 'payée', 'annulée'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Statut non valide.' });
      }
      commande.status = status;
    }

    // Mettre à jour le cash_given et change_to_give
    if (cash_given !== undefined) commande.cash_given = cash_given;
    if (change_to_give !== undefined) commande.change_to_give = change_to_give;

    await commande.save();
    res.status(200).json({ message: 'Commande mise à jour avec succès', commande });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande', error: error.message });
  }
});

// *** DELETE - Supprimer une commande ***
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de commande invalide.' });
    }

    const commande = await Commande.findByIdAndDelete(id);

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    res.status(200).json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la commande', error: error.message });
  }
});

module.exports = router;