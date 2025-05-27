import sequelize from '../config/database.js';
import VecinoModel from './vecino.model.js';
import AsambleaModel from './asamblea.model.js';
import UsuarioModel from './usuario.model.js'; // Asumimos que adaptarás tu modelo de usuario
import RoleModel from './role.model.js'; // Asumimos que adaptarás tu modelo de rol

const Vecino = VecinoModel(sequelize);
const Asamblea = AsambleaModel(sequelize);
const Usuario = UsuarioModel(sequelize); // Este es el usuario general, incluye miembros de la directiva
const Role = RoleModel(sequelize);

// Definición de Asociaciones
// Un usuario (miembro de la directiva) puede crear muchas asambleas
Usuario.hasMany(Asamblea, {
  foreignKey: {
    name: 'creadorId',
    allowNull: false,
  },
  as: 'asambleasCreadas',
});
Asamblea.belongsTo(Usuario, {
  foreignKey: 'creadorId',
  as: 'creador',
});

// Un usuario puede tener un rol
Role.hasMany(Usuario, {
  foreignKey: 'roleId',
  as: 'usuarios',
});
Usuario.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role',
});


// Podrías tener una tabla intermedia para vecinos y asambleas si muchos-a-muchos (ej. asistencia)
// Por ahora, la notificación es a todos los vecinos, no se modela una asistencia directa aquí.

export { sequelize, Vecino, Asamblea, Usuario, Role };