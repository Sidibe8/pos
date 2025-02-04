const Role = require('../models/Role.model');
const mongoose = require('mongoose')
// Créer un nouveau rôle
const createRole = async (req, res) => {
  const { name } = req.body;

  try {
    // Vérifier que le champ name est présent
    if (!name) {
      return res.status(400).json({ message: 'Le nom du rôle est requis.' });
    }

    // Vérifier si le rôle existe déjà
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Ce rôle existe déjà.' });
    }

    // Créer et sauvegarder le nouveau rôle
    const newRole = new Role({ name });
    await newRole.save();

    return res.status(201).json({
      message: 'Rôle créé avec succès',
      role: newRole,
    });
  } catch (error) {
    console.error('Erreur lors de la création du rôle:', error);
    return res.status(500).json({
      message: 'Erreur lors de la création du rôle',
      error: error.message,
    });
  }
};

// Récupérer tous les rôles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    return res.status(200).json(roles);
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération des rôles',
      error: error.message,
    });
  }
};

// Mettre à jour un rôle par son ID
const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID du rôle invalide.' });
    }

    // Vérifier que le champ name est présent
    if (!name) {
      return res.status(400).json({ message: 'Le nom du rôle est requis.' });
    }

    // Mettre à jour le rôle
    const updatedRole = await Role.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedRole) {
      return res.status(404).json({ message: 'Rôle non trouvé.' });
    }

    return res.status(200).json({
      message: 'Rôle mis à jour avec succès',
      role: updatedRole,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour du rôle',
      error: error.message,
    });
  }
};

// Supprimer un rôle par son ID
const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID du rôle invalide.' });
    }

    // Supprimer le rôle
    const deletedRole = await Role.findByIdAndDelete(id);

    if (!deletedRole) {
      return res.status(404).json({ message: 'Rôle non trouvé.' });
    }

    return res.status(200).json({
      message: 'Rôle supprimé avec succès',
      role: deletedRole,
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du rôle:', error);
    return res.status(500).json({
      message: 'Erreur lors de la suppression du rôle',
      error: error.message,
    });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
};
