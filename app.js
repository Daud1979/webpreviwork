const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const User = require('./models/User'); // Importa tu modelo aquí
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'iceidaud',
  resave: false,
  saveUninitialized: false, // Evita crear sesiones vacías
  cookie: {
    httpOnly: true, // Solo accesible desde el servidor, no desde JS del cliente
    secure: process.env.NODE_ENV === 'production', // Solo usa https en producción
    maxAge: 1000 * 60 * 60 * 2 // 2 horas de duración en milisegundos
  },
}));
setInterval(async () => {
  try {
     await User.cerrarAutomatico();    
  } catch (err) {
    console.error('Error limpiando sesiones expiradas:', err);
  }
}, 1000 * 60 * 5); // Cada 5min
// Hacer usuario disponible en vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario;
  res.locals.nombreEmpresa = req.session.nombreEmpresas;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', authRoutes);
app.use('/home', homeRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('error', { message: 'Página no encontrada' });
});

const PORT = process.env.PORT || 3101;
app.listen(PORT, () => console.log('Servidor corriendo en http://localhost:', PORT));
