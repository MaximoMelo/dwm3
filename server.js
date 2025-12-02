const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const MONGO_URI = 'mongodb+srv://maximomelo10_db_user:VXXRDfGBa9FFDdk@githubdwm3.qsnwhzq.mongodb.net/?retryWrites=true&w=majority'

console.log('Conectando a MongoDB...');
mongoose.connect(MONGO_URI)
.then(() => console.log('Conectado a MongoDB'))
.catch(err => {
  console.error('Error de conexión a MongoDB:', err);
});

const ProductoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  ingredientes: [String],
  categoria: String,
  stock: Number,
  descripcion: String
});

const UsuarioSchema = new mongoose.Schema({
  email: String,
  nombre: String,
  direccion: String,
  telefono: String,
  metodoPago: String
});

const PedidoSchema = new mongoose.Schema({
  usuarioEmail: String,
  productos: Object,
  total: Number,
  fecha: { type: Date, default: Date.now },
  estado: String
});

const Producto = mongoose.model('Producto', ProductoSchema);
const Usuario = mongoose.model('Usuario', UsuarioSchema);
const Pedido = mongoose.model('Pedido', PedidoSchema);

app.get('/api/productos', async (req, res) => {
  try {
    console.log('API: Solicitando productos...');
    
    const { categoria, busqueda } = req.query;
    console.log('Filtros recibidos:', { categoria, busqueda });
    
    let filtro = {};
    
    if (categoria && categoria !== 'Categorías') {
      filtro.categoria = categoria;
    }
    
    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { ingredientes: { $in: [new RegExp(busqueda, 'i')] } }
      ];
    }
    
    console.log('Filtro aplicado:', filtro);
    
    const productos = await Producto.find(filtro);
    console.log('Productos encontrados:', productos.length);
    
    res.json(productos);
    
  } catch (error) {
    console.error('ERROR en /api/productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/categorias', async (req, res) => {
  try {
    console.log('API: Solicitando categorías...');
    const categorias = await Producto.distinct('categoria');
    console.log('Categorías encontradas:', categorias);
    res.json(categorias);
  } catch (error) {
    console.error('ERROR en /api/categorias:', error);
    res.json(['Ceviche', 'Pescados al plato', 'Acompañamientos']);
  }
});

app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, precio, categoria, stock, descripcion } = req.body;
    
    const nuevoProducto = new Producto({
      nombre,
      precio: parseFloat(precio),
      categoria,
      stock: parseInt(stock),
      descripcion,
      ingredientes: []
    });
    
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    console.error('ERROR en POST /api/productos:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.get('/api/usuarios/:email', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ email: req.params.email });
    res.json(usuario);
  } catch (error) {
    console.error('ERROR en /api/usuarios/:email:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const { email, nombre, direccion, telefono, metodoPago } = req.body;
    
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    
    const nuevoUsuario = new Usuario({
      email,
      nombre,
      direccion,
      telefono,
      metodoPago
    });
    
    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json(usuarioGuardado);
  } catch (error) {
    console.error('ERROR en POST /api/usuarios:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

app.put('/api/usuarios/:email', async (req, res) => {
  try {
    const { nombre, direccion, telefono, metodoPago } = req.body;
    
    const usuarioActualizado = await Usuario.findOneAndUpdate(
      { email: req.params.email },
      { nombre, direccion, telefono, metodoPago },
      { new: true, upsert: true }
    );
    
    res.json(usuarioActualizado);
  } catch (error) {
    console.error('ERROR en PUT /api/usuarios/:email:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

app.get('/api/pedidos/:usuarioEmail', async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuarioEmail: req.params.usuarioEmail }).sort({ fecha: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error('ERROR en /api/pedidos/:usuarioEmail:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.post('/api/pedidos', async (req, res) => {
  try {
    const { usuarioEmail, productos, total } = req.body;
    
    const nuevoPedido = new Pedido({
      usuarioEmail,
      productos,
      total,
      estado: 'completado'
    });
    
    const pedidoGuardado = await nuevoPedido.save();
    res.status(201).json(pedidoGuardado);
  } catch (error) {
    console.error('ERROR en POST /api/pedidos:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/CarritoCompras.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'CarritoCompras.html'));
});

app.get('/PerfilUsuario.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'PerfilUsuario.html'));
});

app.get('/HistorialPedidos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HistorialPedidos.html'));
});

app.get('/InicioSesion.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'InicioSesion.html'));
});

app.get('/AgregarProducts.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'AgregarProductos.html'));
});

app.get('/BoletaElectronica.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'BoletaElectronica.html'));
});

app.get('/GeneracionReporte.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'GeneracionReporte.html'));
});

app.get('/MetodosPago.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'MetodosPago.html'));
});

app.get('/ProcesoPago.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ProcesoPago.html'));
});

app.get('/ReporteMensual.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ReporteMensual.html'));
});

async function inicializarDatos() {
  try {
    const count = await Producto.countDocuments();
    console.log('Total de productos en BD:', count);
    
    if (count === 0) {
      console.log('Insertando productos de ejemplo...');
      const productosEjemplo = [
        { 
          nombre: 'Ceviche Mixto', 
          precio: 12500, 
          ingredientes: ['pescado', 'limón', 'cebolla', 'cilantro', 'ají'], 
          categoria: 'Ceviche',
          stock: 15, 
          descripcion: 'Ceviche fresco con mariscos' 
        },
        { 
          nombre: 'Congrio a la Plancha', 
          precio: 9990, 
          ingredientes: ['congrio', 'limón', 'aceite de oliva', 'romero'], 
          categoria: 'Pescados al plato',
          stock: 10, 
          descripcion: 'Congrio fresco a la plancha' 
        },
        { 
          nombre: 'Arroz con Mariscos', 
          precio: 6800, 
          ingredientes: ['arroz', 'camarones', 'calamares', 'almejas', 'pimiento'], 
          categoria: 'Acompañamientos',
          stock: 20, 
          descripcion: ' ' 
        },
        { 
          nombre: 'Reineta a la plancha', 
          precio: 7800, 
          ingredientes: ['reineta', 'mantequilla', 'limón', 'pimienta', 'ajo'], 
          categoria: 'Ceviche',
          stock: 20, 
          descripcion: 'Arroz con mix de mariscos' 
        },
        { 
          nombre: 'Machas a la parmesana ', 
          precio: 5800, 
          ingredientes: ['machas', 'queso', 'mantequilla', 'ajo'], 
          categoria: 'Acompañamientos',
          stock: 20, 
          descripcion: 'Machas gratinadas con queso' 
        },
        { 
          nombre: 'Pastel de Jaiba', 
          precio: 7800, 
          ingredientes: ['jaiba', 'cebolla', 'aji', 'queso'], 
          categoria: 'Acompañamientos',
          stock: 15, 
          descripcion: 'Horneado de carne de jaiba' 
        },
        { 
          nombre: 'Chupe de locos', 
          precio: 6600, 
          ingredientes: ['locos', 'queso', 'cebolla', 'aji', 'leche'], 
          categoria: 'Acompañamientos',
          stock: 20, 
          descripcion: 'Guiso espeso de locos' 
        },
        { 
          nombre: 'Caldillo de congrio', 
          precio: 11500, 
          ingredientes: ['congrio', 'papas', 'cebolla', 'aji', 'cilantro'], 
          categoria: 'Pescados al plato',
          stock: 10, 
          descripcion: 'Sopa de congrio' 
        },
        { 
          nombre: 'Ceviche de reineta', 
          precio: 10000, 
          ingredientes: ['reineta', 'limón', 'cebolla', 'cilantro', 'pimienta'], 
          categoria: 'Ceviche',
          stock: 20, 
          descripcion: 'Ceviche fresco de reineta' 
        },
        { 
          nombre: 'Camarones al Pil Pil', 
          precio: 11800, 
          ingredientes: ['camarones', 'aceite de oliva', 'ajo', 'aji verde'], 
          categoria: 'Acompañamientos',
          stock: 15, 
          descripcion: 'Camarones salteados en salsa' 
        }
      ];
      await Producto.insertMany(productosEjemplo);
      console.log('Productos de ejemplo insertados');
    }
  } catch (error) {
    console.error('ERROR en inicializacion:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  inicializarDatos();
});