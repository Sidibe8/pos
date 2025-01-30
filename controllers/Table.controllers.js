const Table = require('../models/Table.model');

// Créer une nouvelle table
const createTable = async (req, res) => {
  const { name } = req.body;

  try {
    // Vérifier si une table avec ce nom existe déjà
    const existingTable = await Table.findOne({ name });
    if (existingTable) {
      return res.status(400).json({ message: 'Cette table existe déjà' });
    }

    // Créer une nouvelle table
    const newTable = new Table({ name });
    await newTable.save();

    return res.status(201).json({ message: 'Table créée avec succès', table: newTable });
  } catch (error) {
    console.error('Erreur lors de la création de la table:', error);
    return res.status(500).json({ message: 'Erreur lors de la création de la table', error: error.message });
  }
};

// Récupérer toutes les tables
const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find();
    return res.status(200).json(tables);
  } catch (error) {
    console.error('Erreur lors de la récupération des tables:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des tables', error: error.message });
  }
};

// Mettre à jour une table par son ID
const updateTable = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedTable = await Table.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedTable) {
      return res.status(404).json({ message: 'Table non trouvée' });
    }

    return res.status(200).json({ message: 'Table mise à jour avec succès', table: updatedTable });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la table:', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la table', error: error.message });
  }
};

// Supprimer une table par son ID
const deleteTable = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTable = await Table.findByIdAndDelete(id);

    if (!deletedTable) {
      return res.status(404).json({ message: 'Table non trouvée' });
    }

    return res.status(200).json({ message: 'Table supprimée avec succès', table: deletedTable });
  } catch (error) {
    console.error('Erreur lors de la suppression de la table:', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression de la table', error: error.message });
  }
};

module.exports = {
  createTable,
  getAllTables,
  updateTable,
  deleteTable
};
