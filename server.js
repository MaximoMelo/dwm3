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

const MONGO_URI = 'mongodb+srv://maximomelo10_db_user:VXXRDfGBa9FFDdk@githubdwm3.qsnwhzq.mongodb.net/marazul?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión:', err));

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

const ReporteSchema = new mongoose.Schema({
  mes: String,
  totalPedidos: Number,
  ingresosTotales: Number,
  productoMasVendido: String
});

const Producto = mongoose.model('Producto', ProductoSchema);
const Usuario = mongoose.model('Usuario', UsuarioSchema);
const Pedido = mongoose.model('Pedido', PedidoSchema);
const Reporte = mongoose.model('Reporte', ReporteSchema);

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
  res.sendFile(path.join(__dirname, 'public', 'AgregarProducts.html'));
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


app.get('/api/productos', async (req, res) => {
  try {
    const { categoria, busqueda } = req.query;
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
    
    const productos = await Producto.find(filtro);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/categorias', async (req, res) => {
  try {
    const categorias = await Producto.distinct('categoria');
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, precio, categoria, stock, descripcion, ingredientes } = req.body;
    
    const nuevoProducto = new Producto({
      nombre,
      precio: parseFloat(precio),
      categoria,
      stock: parseInt(stock),
      descripcion,
      ingredientes: ingredientes ? ingredientes.split(',').map(i => i.trim()) : []
    });
    
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});


app.get('/api/usuarios/:email', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ email: req.params.email });
    res.json(usuario);
  } catch (error) {
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
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});


app.get('/api/pedidos/:usuarioEmail', async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuarioEmail: req.params.usuarioEmail }).sort({ fecha: -1 });
    res.json(pedidos);
  } catch (error) {
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
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});


app.get('/api/reportes/:mes', async (req, res) => {
  try {
    const reporte = await Reporte.findOne({ mes: req.params.mes });
    res.json(reporte);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});


async function inicializarDatos() {
  try {
    const count = await Producto.countDocuments();
    if (count === 0) {
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
          nombre: 'Pescado a la Plancha', 
          precio: 9990, 
          ingredientes: ['pescado', 'limón', 'aceite de oliva', 'romero'], 
          categoria: 'Pescados al plato',
          stock: 10, 
          descripcion: 'Pescado fresco a la plancha' 
        },
        { 
          nombre: 'Arroz con Mariscos', 
          precio: 7800, 
          ingredientes: ['arroz', 'camarones', 'calamares', 'almejas', 'pimiento'], 
          categoria: 'Acompañamientos',
          stock: 20, 
          descripcion: 'Arroz con mix de mariscos' 
        }
      ];
      await Producto.insertMany(productosEjemplo);
      console.log(' Productos de ejemplo insertados');
    }
  } catch (error) {
    console.log('ℹ  Base de datos ya tiene productos o error:', error.message);
  }
}

app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
  inicializarDatos();
}); 