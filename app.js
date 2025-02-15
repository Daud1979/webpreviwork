const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'iceidaud',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 14400000 },
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', authRoutes);
app.use('/home', homeRoutes);

app.use((req, res) => {
  res.status(404).render('error', { message: 'Página no encontrada' });
});
PORT = process.env.PORT || 3101;
app.listen(PORT, () => console.log('Servidor corriendo en http://localhost: ', PORT));
