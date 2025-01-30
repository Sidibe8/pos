const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  prenom: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  numero: {
    type: Number,
    require: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Role', 
    required: true 
  }
}, {timestamps:true});

const Users = mongoose.model('User', UserSchema)
module.exports =  Users