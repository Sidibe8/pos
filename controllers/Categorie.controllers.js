const Categorie = require('../models/Categorie.model');

// Créer une nouvelle catégorie
const createCategorie = async (req, res) => {
  const { name } = req.body;

  try {
    // Vérifier si la catégorie existe déjà
    const existingCategorie = await Categorie.findOne({ name });

    if (existingCategorie) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà' });
    }

    // Créer la catégorie
    const newCategorie = new Categorie({ name });
    await newCategorie.save();

    return res.status(201).json({ message: 'Catégorie créée avec succès', categorie: newCategorie });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return res.status(500).json({ message: 'Erreur lors de la création de la catégorie', error: error.message });
  }
};

// Récupérer toutes les catégories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des catégories', error: error.message });
  }
};

// Mettre à jour une catégorie par son ID
const updateCategorie = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedCategorie = await Categorie.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedCategorie) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    return res.status(200).json({ message: 'Catégorie mise à jour avec succès', categorie: updatedCategorie });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la catégorie', error: error.message });
  }
};

// Supprimer une catégorie par son ID
const deleteCategorie = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategorie = await Categorie.findByIdAndDelete(id);

    if (!deletedCategorie) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    return res.status(200).json({ message: 'Catégorie supprimée avec succès', categorie: deletedCategorie });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie', error: error.message });
  }
};

module.exports = {
  createCategorie,
  getAllCategories,
  updateCategorie,
  deleteCategorie,
};
