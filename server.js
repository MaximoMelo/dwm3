// --- Importaciones ---
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Conexión directa a MongoDB ---
const MONGO_URI = 'mongodb+srv://maximomelo10_db_user:VXXRDfGBa9FFDdk@githubdwm3.qsnwhzq.mongodb.net/?appName=GitHubDWM3'

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión:', err));

// --- Ejemplo de modelo ---
const ProductoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
});

const Producto = mongoose.model('Producto', ProductoSchema);

// --- Rutas ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/productos', async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);  
});

// --- Iniciar servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

