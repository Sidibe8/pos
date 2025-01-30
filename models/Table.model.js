const mongoose =require('mongoose')

const tableSchema = new mongoose.Schema({
    name: {
        type: String,
        require:true,
        unique:true
    }
}, {timestamps:true})

const Table = mongoose.model('Table', tableSchema)
module.exports =  Table