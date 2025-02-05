import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors'; // Importamos el middleware CORS

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',  // Permitir acceso solo desde este dominio
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

// Middleware CORS para Express
const corsOptions = {
  origin: 'http://localhost:5173',  // Permitir solicitudes del frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));  // Usamos el middleware CORS

// Ejemplo de ruta REST
app.get('/location', (req, res) => {
  res.json({ latitude: 40.7128, longitude: -74.0060 }); // Ejemplo de respuesta
});

// Manejo de WebSockets
// Cuando un cliente se conecta, puedes emitirle eventos
io.on('connection', (socket) => {
    console.log('Cliente conectado');
  
    // Enviar información cada 5 segundos al cliente
    setInterval(() => {
      const gpsData = {
        latitude: 40.7128 + Math.random() * 0.001, // Ejemplo de datos GPS simulados
        longitude: -74.0060 + Math.random() * 0.001,
      };
  
      // Enviar datos al cliente conectado
      socket.emit('locationUpdate', gpsData);
    }, 5000);
  
    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });

// Inicia el servidor
const port = 3000;
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
