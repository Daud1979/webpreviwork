// function requireAuth(req, res, next) {
 
//   if (req.session && req.session.userId) {
//     next();
//   } else {
//     res.redirect('/login');
//   }
// }

// module.exports = requireAuth;
const User = require('../models/User');

async function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }

  try {
    // Buscar el usuario por ID
    const user = await User.findById(req.session.idPassEmpresa);

    // Verificar si el sessionId coincide
    if (!user || user.sessionId !== req.sessionID) {
      req.session.destroy(() => {
        return res.redirect('/login?msg=Sesión cerrada por acceso desde otro dispositivo');
      });
    } else {
      next(); // Todo ok, continúa
    }
  } catch (err) {
    console.error('Error en requireAuth:', err);
    res.status(500).send('Error en la autenticación');
  }
}

module.exports = requireAuth;
