const mongoose =require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        require:true,
        unique:true
    },
    categorie:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorie', 
    },
    prix:{
        type:Number,
        require:true
    },
    description:{
        type: String,
    },
    image:{
        type: String,
        require: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {timestamps:true})

const Product = mongoose.model('Product', ProductSchema)
module.exports =  Product