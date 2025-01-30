const Product = require('../models/Product.model');
const Categorie = require('../models/Categorie.model'); // Assurer qu'une catégorie existe avant de l'assigner à un produit
const mongoose = require('mongoose')
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Créer un nouveau produit
const createProduct = async (req, res) => {
  try {
    const { name, categorie, prix, description } = req.body;
    if (!name || !categorie || !prix || !req.file) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifier si la catégorie existe
    if (!mongoose.Types.ObjectId.isValid(categorie)) {
      return res.status(400).json({ message: "ID de la catégorie invalide." });
    }

    // Vérifier que le prix est valide
    const prixValue = parseFloat(prix);
    if (isNaN(prixValue) || prixValue <= 0) {
      return res.status(400).json({ message: "Le prix doit être un nombre supérieur à 0." });
    }

    // Gérer l'upload vers Supabase
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (error) throw error;

    // Construire l'URL de l'image
    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${fileName}`;

    // Créer un nouveau produit
    const newProduct = new Product({
      name,
      categorie,
      prix: prixValue,
      description,
      image: imageUrl, // Stocke l'URL de l'image au lieu d'un fichier local
    });

    await newProduct.save();
    return res.status(201).json({ message: "Produit créé avec succès", product: newProduct });

  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return res.status(500).json({ message: "Erreur lors de la création du produit", error: error.message });
  }
};

// Récupérer tous les produits
const getAllProducts = async (req, res) => {
  try {
    // Récupérer les produits avec leur catégorie (populate pour afficher les données de la catégorie)
    const products = await Product.find().populate('categorie');
    return res.status(200).json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des produits', error: error.message });
  }
};

// Mettre à jour un produit par son ID
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, categorie, prix, description } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });

    let imageUrl = product.image;

    // Si une nouvelle image est envoyée, on l'upload et on supprime l'ancienne
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (error) throw error;

      imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${fileName}`;
    }

    // Mettre à jour le produit
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, categorie, prix, description, image: imageUrl },
      { new: true }
    );

    return res.status(200).json({ message: "Produit mis à jour", product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la mise à jour du produit", error: error.message });
  }
};


// Supprimer un produit par son ID
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });

    // Supprimer l'image de Supabase si elle existe
    if (product.image) {
      const imagePath = product.image.split(`${process.env.SUPABASE_BUCKET}/`)[1];
      await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([imagePath]);
    }

    // Supprimer le produit de la base de données
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ message: "Produit supprimé" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
};
