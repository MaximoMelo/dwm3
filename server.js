const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const productos = [
  { 
    _id: '1',
    nombre: 'Ceviche Mixto', 
    precio: 12500, 
    ingredientes: ['pescado', 'limón', 'cebolla', 'cilantro', 'ají'], 
    categoria: 'Ceviche',
    stock: 15, 
    descripcion: 'Ceviche fresco con mariscos',
    imagen: 'https://buenazo.cronosmedia.glr.pe/original/2020/09/09/5f58f8c082c2f615f804ffdb.jpg'
  },
  { 
    _id: '2',
    nombre: 'Congrio a la Plancha', 
    precio: 9990, 
    ingredientes: ['congrio', 'limón', 'aceite de oliva', 'romero'], 
    categoria: 'Pescados al plato',
    stock: 10, 
    descripcion: 'Congrio fresco a la plancha',
    imagen: 'https://www.800.cl/galeriasitios/Och/2017/6/21/Och_20478_Fl-10682-quotidien-bistro-Fp19.jpg'
  },
  { 
    _id: '3',
    nombre: 'Arroz con Mariscos', 
    precio: 6800, 
    ingredientes: ['arroz', 'camarones', 'calamares', 'almejas', 'pimiento'], 
    categoria: 'Acompañamientos',
    stock: 20, 
    descripcion: ' ',
    imagen: 'https://www.recetasthermomix.pe/wp-content/uploads/recetas_0657c4454ca33fa8c6f001769ab2b80f.jpg'
  },
  { 
    _id: '4',
    nombre: 'Reineta a la plancha', 
    precio: 7800, 
    ingredientes: ['reineta', 'mantequilla', 'limón', 'pimienta', 'ajo'], 
    categoria: 'Ceviche',
    stock: 20, 
    descripcion: 'Arroz con mix de mariscos',
    imagen: 'https://i.pinimg.com/736x/dd/32/37/dd323789ca509bd0e43820337222eb2d.jpg'
  },
  { 
    _id: '5',
    nombre: 'Machas a la parmesana', 
    precio: 5800, 
    ingredientes: ['machas', 'queso', 'mantequilla', 'ajo'], 
    categoria: 'Acompañamientos',
    stock: 20, 
    descripcion: 'Machas gratinadas con queso',
    imagen: 'https://unacocinafeliz.com/wp-content/uploads/2022/10/3-19-500x500.jpg'
  },
  { 
    _id: '6',
    nombre: 'Pastel de Jaiba', 
    precio: 7800, 
    ingredientes: ['jaiba', 'cebolla', 'aji', 'queso'], 
    categoria: 'Acompañamientos',
    stock: 15, 
    descripcion: 'Horneado de carne de jaiba',
    imagen: 'https://images2-mega.cdn.mdstrm.com/meganoticias/2023/10/02/pastel-de-jaiba_427127_1_651ae6d86ac25.jpg'
  },
  { 
    _id: '7',
    nombre: 'Chupe de locos', 
    precio: 6600, 
    ingredientes: ['locos', 'queso', 'cebolla', 'aji', 'leche'], 
    categoria: 'Acompañamientos',
    stock: 20, 
    descripcion: 'Guiso espeso de locos',
    imagen: 'https://www.mariberico.cl/web/wp-content/uploads/2023/03/chupe-de-loco-camaron.jpg'
  },
  { 
    _id: '8',
    nombre: 'Caldillo de congrio', 
    precio: 11500, 
    ingredientes: ['congrio', 'papas', 'cebolla', 'aji', 'cilantro'], 
    categoria: 'Pescados al plato',
    stock: 10, 
    descripcion: 'Sopa de congrio',
    imagen: 'https://www.buzodecahuil.cl/wp-content/uploads/2020/11/caldillo_de_congrio.jpg'
  },
  { 
    _id: '9',
    nombre: 'Ceviche de reineta', 
    precio: 10000, 
    ingredientes: ['reineta', 'limón', 'cebolla', 'cilantro', 'pimienta'], 
    categoria: 'Ceviche',
    stock: 20, 
    descripcion: 'Ceviche fresco de reineta',
    imagen: 'https://cdn0.recetasgratis.net/es/posts/8/6/9/ceviche_de_reineta_77968_orig.jpg'
  },
  { 
    _id: '10',
    nombre: 'Camarones al Pil Pil', 
    precio: 11800, 
    ingredientes: ['camarones', 'aceite de oliva', 'ajo', 'aji verde'], 
    categoria: 'Acompañamientos',
    stock: 15, 
    descripcion: 'Camarones salteados en salsa',
    imagen: 'https://www.800.cl/galeriasitios/Och/Och_12594_Platos-03-CamaronesAlPilPil.jpg'
  }
];

const imagenesSlider = [
  {
    id: 1,
    imagen: 'https://buenazo.cronosmedia.glr.pe/original/2020/09/09/5f58f8c082c2f615f804ffdb.jpg',
  },
  {
    id: 2,
    imagen: 'https://www.recetasthermomix.pe/wp-content/uploads/recetas_0657c4454ca33fa8c6f001769ab2b80f.jpg',
  },
  {
    id: 3,
    imagen: 'https://unacocinafeliz.com/wp-content/uploads/2022/10/3-19-500x500.jpg',
  }
];

const usuarios = {
  'cliente123@gmail.com': {
    email: 'cliente123@gmail.com',
    nombre: 'Cliente',
    direccion: 'Calle, Ciudad',
    telefono: '+56912345678',
    metodoPago: 'Tarjeta de Crédito'
  }
};

const pedidos = [];

app.get('/api/productos', (req, res) => {
  try {
    const { categoria, busqueda } = req.query;
    
    let resultado = [...productos];
    
    if (categoria && categoria !== 'Categorías') {
      resultado = resultado.filter(p => p.categoria === categoria);
    }
    
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busquedaLower) ||
        (p.ingredientes && p.ingredientes.some(ing => ing.toLowerCase().includes(busquedaLower)))
      );
    }
    
    res.json(resultado);
    
  } catch (error) {
    console.error('Error en /api/productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/slider/imagenes', (req, res) => {
  try {
    res.json(imagenesSlider);
  } catch (error) {
    console.error('Error en /api/slider/imagenes:', error);
    res.status(500).json({ error: 'Error al obtener imágenes del slider' });
  }
});

app.get('/api/categorias', (req, res) => {
  try {
    const categorias = [...new Set(productos.map(p => p.categoria))];
    res.json(categorias);
  } catch (error) {
    console.error('Error en /api/categorias:', error);
    res.json(['Ceviche', 'Pescados al plato', 'Acompañamientos']);
  }
});

app.post('/api/productos', (req, res) => {
  try {
    const { nombre, precio, categoria, stock, descripcion } = req.body;
    
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    const nuevoProducto = {
      _id: (productos.length + 1).toString(),
      nombre,
      precio: Number(precio),
      categoria,
      stock: stock ? Number(stock) : 10,
      descripcion: descripcion || '',
      ingredientes: [],
      imagen: 'img/default.jpg'
    };
    
    productos.push(nuevoProducto);
    
    res.status(201).json(nuevoProducto);
    
  } catch (error) {
    console.error('Error en POST /api/productos:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.get('/api/usuarios/:email', (req, res) => {
  try {
    const email = req.params.email;
    
    if (usuarios[email]) {
      res.json(usuarios[email]);
    } else {
      usuarios[email] = {
        email: email,
        nombre: email.split('@')[0],
        direccion: 'Sin dirección registrada',
        telefono: 'Sin teléfono',
        metodoPago: 'No especificado'
      };
      res.json(usuarios[email]);
    }
    
  } catch (error) {
    console.error('Error en /api/usuarios/:email:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

app.post('/api/usuarios', (req, res) => {
  try {
    const { email, nombre, direccion, telefono, metodoPago } = req.body;
    
    if (usuarios[email]) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    
    usuarios[email] = {
      email,
      nombre,
      direccion,
      telefono,
      metodoPago
    };
    
    res.status(201).json(usuarios[email]);
    
  } catch (error) {
    console.error('Error en POST /api/usuarios:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

app.put('/api/usuarios/:email', (req, res) => {
  try {
    const { nombre, direccion, telefono, metodoPago } = req.body;
    const email = req.params.email;
    
    if (!usuarios[email]) {
      usuarios[email] = { email: email };
    }
    
    usuarios[email] = {
      ...usuarios[email],
      nombre: nombre || usuarios[email].nombre,
      direccion: direccion || usuarios[email].direccion,
      telefono: telefono || usuarios[email].telefono,
      metodoPago: metodoPago || usuarios[email].metodoPago
    };
    
    res.json(usuarios[email]);
    
  } catch (error) {
    console.error('Error en PUT /api/usuarios/:email:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

app.get('/api/pedidos/:usuarioEmail', (req, res) => {
  try {
    const usuarioEmail = req.params.usuarioEmail;
    
    const pedidosUsuario = pedidos.filter(p => p.usuarioEmail === usuarioEmail);
    res.json(pedidosUsuario);
    
  } catch (error) {
    console.error('Error en /api/pedidos/:usuarioEmail:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.post('/api/pedidos', (req, res) => {
  try {
    const { usuarioEmail, productos: productosPedido, total } = req.body;
    
    const nuevoPedido = {
      _id: 'pedido_' + Date.now(),
      usuarioEmail,
      productos: productosPedido,
      total: total || 0,
      fecha: new Date(),
      estado: 'completado'
    };
    
    pedidos.push(nuevoPedido);
    
    res.status(201).json(nuevoPedido);
    
  } catch (error) {
    console.error('Error en POST /api/pedidos:', error);
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
});