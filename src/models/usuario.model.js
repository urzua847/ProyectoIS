import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'El nombre de usuario ya existe.',
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'El correo electrónico ya está registrado.',
      },
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rut: {
      type: DataTypes.STRING,
      allowNull: true, 
      unique: true,
    },
    esDirectiva: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    directivaCargo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    directivaVigente: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
  }, {
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.password) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('password') && usuario.password) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      },
    },
  });

  Usuario.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  return Usuario;
};
