const Product = require('../models/Product.model');
const Categorie = require('../models/Categorie.model'); // Pour vérifier l'existence de la catégorie
const mongoose = require('mongoose');
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Créer un nouveau produit
const createProduct = async (req, res) => {
  try {
    const { name, categorie, prix, description } = req.body;

    // Vérifier que tous les champs requis sont présents
    if (!name || !categorie || !prix || !req.file) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifier si un produit avec le même nom existe déjà
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: "Un produit avec ce nom existe déjà." });
    }

    // Vérifier si l'ID de la catégorie est valide
    if (!mongoose.Types.ObjectId.isValid(categorie)) {
      return res.status(400).json({ message: "ID de la catégorie invalide." });
    }

    // Vérifier que la catégorie existe
    const categoryExists = await Categorie.findById(categorie);
    if (!categoryExists) {
      return res.status(400).json({ message: "La catégorie spécifiée n'existe pas." });
    }

    // Vérifier que le prix est un nombre valide et supérieur à 0
    const prixValue = parseFloat(prix);
    if (isNaN(prixValue) || prixValue <= 0) {
      return res.status(400).json({ message: "Le prix doit être un nombre supérieur à 0." });
    }

    // Gérer l'upload de l'image vers Supabase
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) {
      console.error("Erreur lors de l'upload de l'image:", uploadError);
      return res.status(500).json({ message: "Erreur lors de l'upload de l'image." });
    }

    // Construire l'URL de l'image
    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${fileName}`;

    // Créer un nouveau produit
    const newProduct = new Product({
      name,
      categorie,
      prix: prixValue,
      description,
      image: imageUrl,
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
    // Vérifier si le produit existe
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    // Vérifier si l'ID de la catégorie est valide
    if (categorie && !mongoose.Types.ObjectId.isValid(categorie)) {
      return res.status(400).json({ message: "ID de la catégorie invalide." });
    }

    // Vérifier que la catégorie existe
    if (categorie) {
      const categoryExists = await Categorie.findById(categorie);
      if (!categoryExists) {
        return res.status(400).json({ message: "La catégorie spécifiée n'existe pas." });
      }
    }

    // Vérifier que le prix est un nombre valide et supérieur à 0
    if (prix) {
      const prixValue = parseFloat(prix);
      if (isNaN(prixValue) || prixValue <= 0) {
        return res.status(400).json({ message: "Le prix doit être un nombre supérieur à 0." });
      }
    }

    let imageUrl = product.image;

    // Si une nouvelle image est envoyée, on l'upload et on supprime l'ancienne
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) {
        console.error("Erreur lors de l'upload de l'image:", uploadError);
        return res.status(500).json({ message: "Erreur lors de l'upload de l'image." });
      }

      // Supprimer l'ancienne image de Supabase
      if (product.image) {
        const imagePath = product.image.split(`${process.env.SUPABASE_BUCKET}/`)[1];
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([imagePath]);
      }

      imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${fileName}`;
    }

    // Mettre à jour le produit
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, categorie, prix, description, image: imageUrl },
      { new: true }
    );

    return res.status(200).json({ message: "Produit mis à jour avec succès", product: updatedProduct });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour du produit", error: error.message });
  }
};

// Supprimer un produit par son ID
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si le produit existe
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    // Supprimer l'image de Supabase si elle existe
    if (product.image) {
      const imagePath = product.image.split(`${process.env.SUPABASE_BUCKET}/`)[1];
      await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([imagePath]);
    }

    // Supprimer le produit de la base de données
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ message: "Produit supprimé avec succès." });

  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return res.status(500).json({ message: "Erreur lors de la suppression du produit", error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
};