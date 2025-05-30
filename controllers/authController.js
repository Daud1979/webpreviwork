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
    if (isValidEmail(email)) {
    // Valida el nombre de usuario y la contraseña
    const validationData = await User.validatePassword(username, password, email);   
    // Verifica si se encontraron datos y si la propiedad idEmpresa existe y es válida
    
    if (validationData && validationData[0] && validationData[0].idEmpresa > 0) {
      req.session.userId = validationData[0].idEmpresa;
      req.session.email = validationData[0].email;
      req.session.usuario =`Iniciaste: ${validationData[0].usuario}`;
      req.session.idPassEmpresa=validationData[0].idPassEmpresa;      
      // Busca la información del usuario por ID de la empresa
      userData = await User.findByUsername(validationData[0].idEmpresa);

      return res.json({ success: true, "userData":userData });
      } else {
      // Responde con error si la validación falló
        return res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
      }
    }
    else
    {
      return res.json({ success: false, message: 'Email no tiene el formato correcto' });
    }
  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    
    if (err) return res.redirect('/home');
    res.redirect('/login');
  });
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