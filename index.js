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

  // GPS Cliente
  setInterval(() => {
    socket.on("gpsData", (gpsData) => {
      console.log("Ubicación recibida:", gpsData);

      socket.broadcast.emit("locationUpdate", gpsData);
    });
  }, 5000);

  // Giroscopio Cliente
  socket.on('gyroscopeData', (data) => {
    console.log('Datos del giroscopio recibidos:', data);

    socket.broadcast.emit('gyroscopeUpdate', data);
  });

  //Acelerometro Cliente
  socket.on('accelerometerData', (data) => {
    console.log('Datos del acelerómetro recibidos:', data);
    socket.broadcast.emit('accelerometerUpdate', data);
  });

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
