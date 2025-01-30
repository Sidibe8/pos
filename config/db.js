// db.js

const mongoose = require('mongoose');

// Fonction de connexion à la base de données MongoDB
const connectDB = async () => {
  try {
    // Utilise l'URL de ta base de données (remplace par la chaîne de connexion appropriée)
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    
      serverSelectionTimeoutMS: 30000, // Temps d'attente avant d'échouer
    });

    console.log('Connecté à MongoDB avec succès');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB', error);
    process.exit(1); // Arrêter le processus si la connexion échoue
  }
};

module.exports = connectDB;
