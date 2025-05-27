// src/models/role.model.js
// Adaptación del modelo Role para Sequelize
import { DataTypes } from 'sequelize';
import ROLES from '../constants/roles.constants.js'; // Asumiendo que este archivo define los roles como un array de strings

export default (sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isIn: {
          args: [ROLES], // Valida que el nombre del rol esté en la lista de ROLES permitidos
          msg: 'El rol especificado no es válido.',
        },
      },
    },
  }, {
    tableName: 'roles',
    timestamps: false, // Generalmente los roles no necesitan timestamps
  });
  return Role;
};
