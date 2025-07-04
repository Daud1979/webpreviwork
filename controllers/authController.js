const User = require('../models/User');

exports.login = (req, res) => {
  if (req.session.userId > 0) {   
   
    res.redirect('/home'); // Redirige a /home si el usuario está autenticado
  } else {
    res.render('login'); // Muestra la vista de inicio de sesión si no está autenticado
  }
};

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
exports.authenticate = async (req, res) => {  
  try {
    const { email, username, password } = req.body;  

    if (!isValidEmail(email)) {
      return res.json({ success: false, message: 'Email no tiene el formato correcto' });
    }

    const validationData = await User.validatePassword(username, password, email);

    if (!validationData || !validationData[0] || !validationData[0].idEmpresa) {
      return res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    const user = validationData[0];

    // VERIFICAR SI YA TIENE SESIÓN ACTIVA
    if (user.sessionId && user.sessionId !== req.sessionID) {
      return res.json({ success: false, message: 'Ya hay una sesión activa en otro dispositivo.' });
    }
   
    // GUARDAR LA SESIÓN ACTUAL
    req.session.userId = user.idEmpresa;
    req.session.email = user.email;
    req.session.usuario = `Usuario: ${user.Usuario}`;
    req.session.nombreEmpresas = `: ${user.razonSocial}`;
    req.session.idPassEmpresa = user.idPassEmpresa;
    

    // ACTUALIZAR sessionId EN BD
    await User.updateSessionId(req.session.idPassEmpresa, req.sessionID);

    // OBTENER DATOS DEL USUARIO
    const userData = await User.findByUsername(user.idEmpresa);

    return res.json({ success: true, userData });

  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.session.userId) {     
      await User.updateSessionIdSalir(req.session.idPassEmpresa, null);
    }

    req.session.destroy(() => {
      res.redirect('/login'); // O response JSON si es API
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).send('Error al cerrar sesión');
  }
};

exports.inicio = (req, res) => {
   if(req.session.userId>0)
   {    
     
    res.redirect('/home');
   }
   else
   {
    res.redirect('/login');
   }
};