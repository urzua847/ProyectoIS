import sequelize from '../config/database.js';
import VecinoModel from './vecino.model.js';
import AsambleaModel from './asamblea.model.js';
import UsuarioModel from './usuario.model.js'; 
import RoleModel from './role.model.js';
import InformeModel from './informe.model.js';

const Vecino = VecinoModel(sequelize);
const Asamblea = AsambleaModel(sequelize);
const Usuario = UsuarioModel(sequelize); 
const Role = RoleModel(sequelize);
const Informe = InformeModel(sequelize);


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

Role.hasMany(Usuario, {
  foreignKey: 'roleId',
  as: 'usuarios',
});
Usuario.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role',
});


export { sequelize, Vecino, Asamblea, Usuario, Role, Informe };