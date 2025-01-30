const express = require('express');
const router = express.Router();
const Commande = require('../models/Commande.model');
const Product = require('../models/Product.model'); // Assurez-vous d'importer le modèle Product

// *** CREATE ***
router.post('/', async (req, res) => {
  try {
    const { products, user, cashGiven, changeToGive } = req.body;
    
    // Vérifiez que tous les champs nécessaires sont présents
    if (!user) {
      return res.status(400).json({ message: 'Données manquantes dans la requête' });
    }

    let total_price = 0;
    for (const item of products) {
      if (!item.product) {
        return res.status(400).json({ message: 'Produit ID manquant' });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Produit non trouvé pour l'ID : ${item.product}` });
      }

      total_price += item.price * item.quantity; // Calculez le prix total
    }

    const newCommande = new Commande({
      products,
      user: user, // Assurez-vous de transmettre l'ID de l'utilisateur
      total_price,
      cash_given: parseFloat(cashGiven),
      change_to_give: changeToGive,
      status: 'payée', // Statut par défaut
    });

    await newCommande.save();
    res.status(201).json({ message: 'Commande créée avec succès', commande: newCommande });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la commande', error });
  }
});



// *** READ - Get All Commandes ***
router.get('/', async (req, res) => {
  try {
    const commandes = await Commande.find().populate('products.product').populate('user');
    res.status(200).json(commandes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error });
  }
});

// *** READ - Get Commande by ID ***
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await Commande.findById(id).populate('products.product').populate('user');

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la commande', error });
  }
});

// *** UPDATE - Modifier une commande (inclut le statut) ***
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, products, cash_given, change_to_give } = req.body;

    const commande = await Commande.findById(id);

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Mettre à jour les produits si fournis
    if (products) {
      commande.products = products;
      // Recalculer le prix total si les produits changent
      let total_price = 0;
      for (const item of products) {
        total_price += item.price * item.quantity; // Utilisation du prix envoyé
      }
      commande.total_price = total_price;
    }

    // Mettre à jour le statut si fourni
    if (status) {
      const validStatuses = ['en_attente', 'en_cours', 'payée', 'annulée'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Statut non valide' });
      }
      commande.status = status;
    }

    // Mettre à jour le cash_given et change_to_give
    if (cash_given !== undefined) commande.cash_given = cash_given;
    if (change_to_give !== undefined) commande.change_to_give = change_to_give;

    await commande.save();
    res.status(200).json({ message: 'Commande mise à jour avec succès', commande });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande', error });
  }
});

// *** DELETE - Supprimer une commande ***
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await Commande.findByIdAndDelete(id);

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.status(200).json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la commande', error });
  }
});

module.exports = router;
