import { DataTypes } from 'sequelize';
import ROLES from '../constants/roles.constants.js'; 

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
          args: [ROLES], 
          msg: 'El rol especificado no es válido.',
        },
      },
    },
  }, {
    tableName: 'roles',
    timestamps: false,
  });
  return Role;
};
