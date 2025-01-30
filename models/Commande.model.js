const mongoose = require('mongoose');

const CommandeSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product', // Référence au modèle Product
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'La quantité doit être au moins 1.'],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Référence au modèle User
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    cash_given: { // Montant d'argent donné par le client
      type: Number,
      required: true,
    },
    change_to_give: { // Montant du changement à rendre
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['en_attente', 'payée', 'annulée'],
      default: 'payée',
    },
    is_paid: {
      type: Boolean,
      default: false, // Indique si la commande est payée ou non
    },
  },
  { timestamps: true } // Ajoute createdAt et updatedAt automatiquement
);

const Commande = mongoose.model('Commande', CommandeSchema);
module.exports = Commande;
