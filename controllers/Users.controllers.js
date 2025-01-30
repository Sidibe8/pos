const Role = require("../models/Role.model");
const Users = require("../models/Users.model");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
// Créer un nouvel utilisateur
const createUser = async (req, res) => {
  const { prenom, email, password, numero, role } = req.body;

  try {
    // Vérifier si tous les champs nécessaires sont présents
    if (!prenom || !email || !password || !numero || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Vérifier si le rôle existe dans la collection Role
    const existingRole = await Role.findById(role);
    if (!existingRole) {
      return res.status(400).json({ message: 'Le rôle spécifié n\'existe pas' });
    }

    // Vérifier si le mot de passe est valide
    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    // Hashage du mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur avec les données fournies
    const newUser = new Users({ prenom, email, password: hashedPassword, numero, role });
    
    // Sauvegarder l'utilisateur dans la base de données
    await newUser.save();
    
    console.log("Utilisateur créé avec succès");
    return res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    return res.status(500).json({ message: "Erreur lors de la création de l'utilisateur", error: error.message });
  }
};

  

  // Login de l'utilisateur
const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Vérifier si l'utilisateur existe avec cet email
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé' });
      }
  
      // Comparer le mot de passe fourni avec le mot de passe stocké (haché) dans la base de données
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }
  
      // Générer un token JWT
      const token = jwt.sign(
        { userId: user._id, role: user.role },  // Payload avec les informations de l'utilisateur
        process.env.JWT_SECRET,                 // Clé secrète pour signer le token (assure-toi que la clé est bien définie dans .env)
        { expiresIn: '1h' }                    // Durée de validité du token (1 heure)
      );
  
      // Répondre avec le token d'authentification
      return res.status(200).json({ message: 'Connexion réussie', token, user });
    } catch (error) {
      console.error("Erreur lors de la connexion de l'utilisateur :", error);
      return res.status(500).json({ message: "Erreur lors de la connexion de l'utilisateur", error: error.message });
    }
  };
// Trouver tous les utilisateurs
const getAllUsers = async (req, res) => {
    try {
      // Utilisation de populate pour peupler le champ "role" avec les données correspondantes
      const users = await Users.find().populate("role"); // "role" est la clé à peupler avec les données du modèle Role
  
  
      // Renvoi des utilisateurs avec leurs rôles associés
      return res.status(200).json(users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      return res.status(500).json({
        message: "Erreur lors de la récupération des utilisateurs",
        error: error.message,
      });
    }
  };
  

// Mettre à jour un utilisateur par son id
const updateUser = async (req, res) => {
  const { id } = req.params; // Récupérer l'ID de l'utilisateur depuis l'URL
  let { password, ...updatedData } = req.body; // Récupérer les nouvelles données et le mot de passe séparément

  try {
    // Si un nouveau mot de passe est fourni, le hacher avant la mise à jour
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword; // Ajouter le mot de passe haché aux données mises à jour
    }

    // Mettre à jour l'utilisateur dans la base de données
    const user = await Users.findByIdAndUpdate(id, updatedData, { new: true });
    if (!user) {
      console.log("Utilisateur non trouvé pour mise à jour");
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("Utilisateur mis à jour :", user);
    return res.status(200).json({ message: "Utilisateur mis à jour avec succès",token:'No token needed', user });
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error: error.message });
  }
};

// Supprimer un utilisateur par son id
const deleteUser = async (req, res) => {
  const { id } = req.params; // Récupérer l'ID de l'utilisateur depuis l'URL
  
  try {
    const user = await Users.findByIdAndDelete(id);
    if (!user) {
      console.log("Utilisateur non trouvé pour suppression");
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    console.log("Utilisateur supprimé :", user);
    return res.status(200).json({ message: "Utilisateur supprimé avec succès", user });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    return res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur", error: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
};
