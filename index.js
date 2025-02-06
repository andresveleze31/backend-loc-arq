import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(express.json()); // Para poder parsear los datos en formato JSON

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Permitir solicitudes desde el cliente
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

const corsOptions = {
  origin: 'http://localhost:5173',  // Permitir solicitudes desde el frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

// Cuando un cliente se conecta, escuchamos por el evento `sendLocation`
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Escuchar el evento 'sendLocation' enviado desde el cliente
  socket.on('sendLocation', (locationData) => {
    console.log('Datos recibidos del cliente:', locationData);

    // Aquí podemos modificar o procesar los datos si es necesario
    // Luego enviamos los mismos datos de vuelta al cliente
    socket.emit('locationUpdate', locationData);
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.post('/location', (req, res) => {
  const { latitude, longitude } = req.body;

  // Devuelve los mismos datos recibidos
  res.json({
    latitude: latitude,
    longitude: longitude,
  });
});

app.get('/location-http', (req, res) => {
  // Simulando un cambio en la ubicación
  const location = {
    latitude: 40.7128 + Math.random() * 0.001, // Datos GPS simulados
    longitude: -74.0060 + Math.random() * 0.001,
  };

  // Responder con los datos de ubicación
  res.json(location);
});

// Inicia el servidor
const port = 3000;
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
