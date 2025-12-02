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
    nombre: 'Pulpo al Olivo', 
    precio: 14500, 
    ingredientes: ['pulpo', 'aceitunas', 'limón', 'aceite de oliva'], 
    categoria: 'Entradas',
    stock: 8, 
    descripcion: 'Pulpo tierno con salsa de olivas' 
  },
  { 
    _id: '5',
    nombre: 'Camarones al Ajillo', 
    precio: 11200, 
    ingredientes: ['camarones', 'ajo', 'vino blanco', 'perejil'], 
    categoria: 'Entradas',
    stock: 12, 
    descripcion: 'Camarones salteados al ajillo' 
  },
  { 
    _id: '6',
    nombre: 'Machas a la Parmesana', 
    precio: 9800, 
    ingredientes: ['machas', 'queso parmesano', 'mantequilla', 'vino blanco'], 
    categoria: 'Entradas',
    stock: 18, 
    descripcion: 'Machas gratinadas con queso parmesano' 
  },
  { 
    _id: '7',
    nombre: 'Paila Marina', 
    precio: 8900, 
    ingredientes: ['pescado', 'mariscos', 'caldo', 'verduras'], 
    categoria: 'Sopas',
    stock: 25, 
    descripcion: 'Sopa de mariscos tradicional' 
  },
  { 
    _id: '8',
    nombre: 'Salmon a la Mostaza', 
    precio: 13800, 
    ingredientes: ['salmón', 'mostaza', 'miel', 'limón'], 
    categoria: 'Pescados al plato',
    stock: 14, 
    descripcion: 'Salmón con salsa de mostaza y miel' 
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

const usuariosEjemplo = {};
const pedidosEjemplo = [];
let categoriasExistentes = ['Ceviche', 'Pescados al plato', 'Acompañamientos', 'Entradas', 'Sopas'];

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
        productosResultado = productosResultado.filter(p => p.categoria === categoria);
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
      const categoriasProductos = [...new Set(productosEjemplo.map(p => p.categoria))];
      categorias = [...new Set([...categoriasProductos, ...categoriasExistentes])];
    }
    
    console.log(`API: Categorías: ${categorias.length}`);
    res.json(categorias);
    
  } catch (error) {
    console.error('Error en /api/categorias:', error.message);
    res.json(categoriasExistentes);
  }
});

app.post('/api/productos', async (req, res) => {
    try {
        const nuevoProducto = req.body;
        
        if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.categoria) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }
        
        nuevoProducto._id = Date.now().toString();
        nuevoProducto.precio = Number(nuevoProducto.precio);
        nuevoProducto.stock = nuevoProducto.stock ? Number(nuevoProducto.stock) : 10;
        
        productosEjemplo.push(nuevoProducto);
        
        if (!categoriasExistentes.includes(nuevoProducto.categoria)) {
            categoriasExistentes.push(nuevoProducto.categoria);
        }
        
        console.log('Producto agregado:', nuevoProducto.nombre);
        res.status(201).json({ mensaje: 'Producto agregado', producto: nuevoProducto });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/usuarios/:email', (req, res) => {
    const email = req.params.email;
    
    if (usuariosEjemplo[email]) {
        res.json(usuariosEjemplo[email]);
    } else {
        usuariosEjemplo[email] = {
            email: email,
            nombre: email.split('@')[0],
            direccion: 'Sin dirección',
            telefono: 'Sin teléfono',
            metodoPago: 'No especificado'
        };
        res.json(usuariosEjemplo[email]);
    }
});

app.put('/api/usuarios/:email', (req, res) => {
    const email = req.params.email;
    const datos = req.body;
    
    if (!usuariosEjemplo[email]) {
        usuariosEjemplo[email] = { email: email };
    }
    
    usuariosEjemplo[email] = {
        ...usuariosEjemplo[email],
        nombre: datos.nombre || usuariosEjemplo[email].nombre,
        direccion: datos.direccion || usuariosEjemplo[email].direccion,
        telefono: datos.telefono || usuariosEjemplo[email].telefono,
        metodoPago: datos.metodoPago || usuariosEjemplo[email].metodoPago
    };
    
    console.log('Perfil actualizado:', email);
    res.json({ mensaje: 'Perfil actualizado', usuario: usuariosEjemplo[email] });
});

app.post('/api/pedidos', (req, res) => {
    try {
        const pedido = req.body;
        
        pedido.id = 'PED-' + Date.now().toString().slice(-6);
        pedido.fecha = new Date().toLocaleDateString('es-CL');
        pedido.estado = 'completado';
        
        pedidosEjemplo.push(pedido);
        
        console.log('Pedido guardado:', pedido.id);
        res.status(201).json({ mensaje: 'Pedido guardado', pedido: pedido });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/pedidos/:email', (req, res) => {
    const email = req.params.email;
    const pedidosUsuario = pedidosEjemplo.filter(p => p.email === email);
    res.json(pedidosUsuario);
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

app.get('/AgregarProductos.html', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Modo: ${usandoMongoDB ? 'MongoDB Atlas' : 'Datos en memoria'}`);
});