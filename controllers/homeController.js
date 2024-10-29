const User = require('../models/User');
exports.index =async (req, res) => {
  userData = await User.findByUsername(req.session.userId);
  gestionData = await User.findGestion();
  res.render('home');
};
exports.modifyEmpresa=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  updateData = await User.modifyEmpresa(datos.direccion,datos.encargado,datos.email,datos.telefono,idEmpresa)
  const mensaje =(updateData>0)?true:`SE PRODUJO UN ERROR AL MODIFICAR`;
  res.json({message:mensaje});
}
exports.centros=async (req,res)=>{
  const idEmpresa = req.session.userId;
  listCentro = await User.listCentroEmpresa(idEmpresa);
  (req.session.userId>0)? res.render('centros',{listCentro}):res.redirect('/');
}