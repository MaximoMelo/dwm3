const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let usandoMongoDB = false;
let ProductoModel = null;


const productosEjemplo = [
  { 
    _id: '1',
    nombre: 'Ceviche Mixto', 
    precio: 12500, 
    ingredientes: ['pescado', 'limón', 'cebolla', 'cilantro', 'ají'], 
    categoria: 'Ceviche',
    stock: 15, 
    descripcion: 'Ceviche fresco con mariscos' 
  },
  { 
    _id: '2',
    nombre: 'Congrio a la Plancha', 
    precio: 9990, 
    ingredientes: ['congrio', 'limón', 'aceite de oliva', 'romero'], 
    categoria: 'Pescados al plato',
    stock: 10, 
    descripcion: 'Congrio fresco a la plancha' 
  },
  { 
    _id: '3',
    nombre: 'Arroz con Mariscos', 
    precio: 6800, 
    ingredientes: ['arroz', 'camarones', 'calamares', 'almejas', 'pimiento'], 
    categoria: 'Acompañamientos',
    stock: 20, 
    descripcion: 'Arroz con mix de mariscos' 
  },
  { 
    _id: '4',
    nombre: 'Reineta a la plancha', 
    precio: 7800, 
    ingredientes: ['reineta', 'mantequilla', 'limón', 'pimienta', 'ajo'], 
    categoria: 'Ceviche',
    stock: 20, 
    descripcion: 'Arroz con mix de mariscos' 
  },
  { 
    _id: '5',
    nombre: 'Machas a la parmesana ', 
    precio: 5800, 
    ingredientes: ['machas', 'queso', 'mantequilla', 'ajo'], 
    categoria: 'Acompañamientos',
    stock: 20, 
    descripcion: 'Machas gratinadas con queso' 
  },
  { 
    _id: '6',
    nombre: 'Pastel de Jaiba', 
    precio: 7800, 
    ingredientes: ['jaiba', 'cebolla', 'aji', 'queso'], 
    categoria: 'Acompañamientos',
    stock: 15, 
    descripcion: 'Horneado de carne de jaiba' 
  },
  { 
    _id: '7',
    nombre: 'Chupe de locos', 
    precio: 6600, 
    ingredientes: ['locos', 'queso', 'cebolla', 'aji', 'leche'], 
    categoria: 'Acompañamientos',
    stock: 20, 
    descripcion: 'Guiso espeso de locos' 
  },
  { 
    _id: '8',
    nombre: 'Caldillo de congrio', 
    precio: 11500, 
    ingredientes: ['congrio', 'papas', 'cebolla', 'aji', 'cilantro'], 
    categoria: 'Pescados al plato',
    stock: 10, 
    descripcion: 'Sopa de congrio' 
  },
  { 
    _id: '9',
    nombre: 'Ceviche de reineta', 
    precio: 10000, 
    ingredientes: ['reineta', 'limón', 'cebolla', 'cilantro', 'pimienta'], 
    categoria: 'Ceviche',
    stock: 20, 
    descripcion: 'Ceviche fresco de reineta' 
  },
  { 
    _id: '10',
    nombre: 'Camarones al Pil Pil', 
    precio: 11800, 
    ingredientes: ['camarones', 'aceite de oliva', 'ajo', 'aji verde'], 
    categoria: 'Acompañamientos',
    stock: 15, 
    descripcion: 'Camarones salteados en salsa' 
  }
];

const MONGO_URI = 'mongodb+srv://maximomelo10_db_user:VXXRDfGBa9FFDdk@githubdwm3.qsnwhzq.mongodb.net/marazul?retryWrites=true&w=majority';

console.log('Intentando conectar a MongoDB...');
mongoose.connect(MONGO_URI, { 
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000 
})
.then(() => {
  console.log('Conectado a MongoDB Atlas');
  usandoMongoDB = true;
  
  const ProductoSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    ingredientes: [String],
    categoria: String,
    stock: Number,
    descripcion: String
  });
  
  ProductoModel = mongoose.model('Producto', ProductoSchema);
  
  inicializarDatosMongoDB();
})
.catch(err => {
  console.log('Usando datos en memoria');
  console.log('(MongoDB no disponible o en configuración)');
});

async function inicializarDatosMongoDB() {
  if (!usandoMongoDB || !ProductoModel) return;
  
  try {
    const count = await ProductoModel.countDocuments();
    console.log(`Productos en MongoDB: ${count}`);
    
    if (count === 0) {
      console.log('Insertando productos de ejemplo en MongoDB...');
      await ProductoModel.insertMany(productosEjemplo);
      console.log('Productos insertados en MongoDB');
    }
  } catch (error) {
    console.log('Error inicializando MongoDB:', error.message);
  }
}

app.get('/api/productos', async (req, res) => {
  try {
    const { categoria, busqueda } = req.query;
    
    let productosResultado = [];
    
    if (usandoMongoDB && ProductoModel) {
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
      
      productosResultado = await ProductoModel.find(filtro);
    } else {
      productosResultado = [...productosEjemplo];
      
      if (categoria && categoria !== 'Categorías') {
        productosResultado = productosResultado.filter(p => 
          p.categoria === categoria
        );
      }
      
      if (busqueda) {
        const busquedaLower = busqueda.toLowerCase();
        productosResultado = productosResultado.filter(p => 
          p.nombre.toLowerCase().includes(busquedaLower) ||
          (p.ingredientes && p.ingredientes.some(ing => ing.toLowerCase().includes(busquedaLower)))
        );
      }
    }
    
    console.log(`API: Enviando ${productosResultado.length} productos (MongoDB: ${usandoMongoDB ? 'SÍ' : 'NO'})`);
    res.json(productosResultado);
    
  } catch (error) {
    console.error('Error en /api/productos:', error.message);
    res.json(productosEjemplo);
  }
});

app.get('/api/categorias', async (req, res) => {
  try {
    let categorias = [];
    
    if (usandoMongoDB && ProductoModel) {
      categorias = await ProductoModel.distinct('categoria');
    } else {
      categorias = [...new Set(productosEjemplo.map(p => p.categoria))];
    }
    
    console.log(`API: Categorías: ${categorias.length} (MongoDB: ${usandoMongoDB ? 'SÍ' : 'NO'})`);
    res.json(categorias);
    
  } catch (error) {
    console.error('Error en /api/categorias:', error.message);
    res.json(['Ceviche', 'Pescados al plato', 'Acompañamientos']);
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Modo: ${usandoMongoDB ? 'MongoDB Atlas' : 'Datos en memoria'}`);
  console.log(`API: http://localhost:${PORT}/api/productos`);
});