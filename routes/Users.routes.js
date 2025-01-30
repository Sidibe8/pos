const express = require("express");
const Users = express.Router();
const userController = require("../controllers/Users.controllers");

// Créer un nouvel utilisateur
Users.post("/create", userController.createUser);
// logger un nouvel utilisateur
Users.post("/login", userController.loginUser);

// Récupérer tous les utilisateurs
Users.get("/", userController.getAllUsers);

// Mettre à jour un utilisateur par son ID
Users.put("/update/:id", userController.updateUser);

// Supprimer un utilisateur par son ID
Users.delete("/delete/:id", userController.deleteUser);

module.exports = Users;
