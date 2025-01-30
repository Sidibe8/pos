const express = require('express');
const app = express()
const path = require('path')
const cors = require('cors');
const bodyParser =  require('body-parser');
require('dotenv').config()
const connectDB = require('./config/db');

app.use(cors());
// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// base de donnee
connectDB()
// routes
const TableRouter = require('./routes/Table.routes');
const CategorieRouter = require('./routes/categorie.routes');
const role = require('./routes/Role.routes');
const Users = require('./routes/Users.routes');
const Order = require('./controllers/Commande.controllers');
const ProductRouter = require('./routes/Product.routes');


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Bienvenue sur mon application')
  })


// Utilisation des routes des tables
app.use('/table', TableRouter);
app.use('/categorie', CategorieRouter);
app.use('/product', ProductRouter);
app.use('/role', role);
app.use('/users', Users);
app.use('/order', Order);
  

app.listen(process.env.PORT, () => console.log('server running on port', process.env.PORT,'...'))