import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Vecino = sequelize.define('Vecino', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre no puede estar vacío.',
        },
      },
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El apellido no puede estar vacío.',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'El correo electrónico ya está registrado.',
      },
      validate: {
        isEmail: {
          msg: 'Debe ser una dirección de correo electrónico válida.',
        },
        notEmpty: {
          msg: 'El correo electrónico no puede estar vacío.',
        },
      },
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true, // Puede ser opcional
    },
    informacionContacto: { // Para otros datos de contacto
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // createdAt y updatedAt son automáticos con Sequelize
  }, {
    tableName: 'vecinos',
    timestamps: true, // Habilita createdAt y updatedAt
  });
  return Vecino;
};
