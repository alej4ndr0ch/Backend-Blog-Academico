import { verify } from 'argon2';

export const verificarExistenciaUsuario = (req, res) => {
  if (!req.user) {
    return res.status(400).json({
      msg: 'Credenciales incorrectas, Correo no existe en la base de datos'
    });
  }
};

export const verificarEstadoUsuario = (req, res) => {
  if (!req.user.estado) {
    return res.status(400).json({
      msg: 'El usuario no existe en la base de datos'
    });
  }
};

export const verificarPassword = async (req, res) => {
  const { password } = req.body;
  const user = req.user;

  const validPassword = await verify(user.password, password);

  if (!validPassword) {
    return res.status(400).json({
      msg: 'La contraseña es incorrecta'
    });
  }
};

export const verificarCamposRegistro = (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({
      message: "Faltan campos requeridos para el registro"
    });
  }
};