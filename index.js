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

let latestData = {
  gps: { latitude: null, longitude: null },
  acelerometro: { x: null, y: null, z: null },
  giroscopio: { alpha: null, beta: null, gamma: null },
};

// ✅ Endpoint REST para recibir datos de GPS
app.post('/gps', (req, res) => {
  latestData.gps = req.body;
  console.log("Datos de GPS recibidos:", req.body);
  res.json({ status: "Datos de GPS recibidos correctamente" });

  // Emitir actualización a todos los clientes WebSockets
  io.emit("locationUpdate", req.body);
});

// ✅ Endpoint REST para recibir datos del acelerómetro
app.post('/acelerometro', (req, res) => {
  latestData.acelerometro = req.body;
  console.log("Datos de acelerómetro recibidos:", req.body);
  res.json({ status: "Datos de acelerómetro recibidos correctamente" });

  io.emit("accelerometerUpdate", req.body);
});

// ✅ Endpoint REST para recibir datos del giroscopio
app.post('/giroscopio', (req, res) => {
  latestData.giroscopio = req.body;
  console.log("Datos de giroscopio recibidos:", req.body);
  res.json({ status: "Datos de giroscopio recibidos correctamente" });

  io.emit("gyroscopeUpdate", req.body);
});

// ✅ Endpoint REST para obtener la última posición registrada
app.get('/position', (req, res) => {
  res.json(latestData);
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
