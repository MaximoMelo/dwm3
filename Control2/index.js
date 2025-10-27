import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

let productos = [];
let idCounter = 1;

const typeDefs = `#graphql
  # Estructura del objeto Producto (Requerimiento: nombre: str, descripcion: str, valor: int)
  type Producto {
    id: ID!
    nombre: String!
    descripcion: String!
    valor: Int!
  }

  # Consultas (Read - R del CRUD)
  type Query {
    obtenerProductos: [Producto!]!
    obtenerProducto(id: ID!): Producto
  }

  # Mutaciones (Create, Update, Delete - CUD del CRUD)
  type Mutation {
    # C - Create
    crearProducto(nombre: String!, descripcion: String!, valor: Int!): Producto!
    # U - Update: Los campos son opcionales para permitir actualizaciones parciales (PATCH)
    actualizarProducto(id: ID!, nombre: String, descripcion: String, valor: Int): Producto
    # D - Delete
    eliminarProducto(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    obtenerProductos: () => productos,
    
    obtenerProducto: (_, { id }) => productos.find(p => p.id === id),
  },

  Mutation: {
    crearProducto: (_, { nombre, descripcion, valor }) => {
      const nuevoProducto = { 
        id: String(idCounter++), 
        nombre, 
        descripcion, 
        valor 
      };
      productos.push(nuevoProducto);
      return nuevoProducto;
    },

    actualizarProducto: (_, { id, nombre, descripcion, valor }) => {
      const producto = productos.find(p => p.id === id);
      if (!producto) return null; 

      if (nombre !== undefined) producto.nombre = nombre;
      if (descripcion !== undefined) producto.descripcion = descripcion;
      if (valor !== undefined) producto.valor = valor;

      return producto;
    },

    eliminarProducto: (_, { id }) => {
      const index = productos.findIndex(p => p.id === id);
      if (index === -1) return false; 

      productos.splice(index, 1); 
      return true;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4000 } })
  .then(({ url }) => {
    console.log(`Servidor listo en: ${url}`);
    console.log(`Abrir en el navegador para usar el Sandbox: ${url}`);
  })
  .catch(error => {
    console.error("Error al iniciar el servidor:", error);
  });