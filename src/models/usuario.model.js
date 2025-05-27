// Este es una adaptación del modelo User que proporcionaste, usando Sequelize.
// Deberás ajustar los campos y validaciones según tus necesidades exactas.
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: { // Podría ser nombre + apellido o un nombre de usuario único
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
    rut: { // Si lo necesitas para los usuarios/directiva
      type: DataTypes.STRING,
      allowNull: true, // O false si es obligatorio
      unique: true,
    },
    // directivaEstado se usaría para saber si un miembro de la directiva está activo/vigente
    // Podrías tener una tabla separada para 'MiembroDirectiva' o añadir campos aquí.
    // Por simplicidad, lo añado aquí, pero considera normalizarlo.
    esDirectiva: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    directivaCargo: { // Ejemplo: Presidente, Secretario, Tesorero
        type: DataTypes.STRING,
        allowNull: true,
    },
    directivaVigente: { // Para saber si su periodo en la directiva está activo
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // roleId se añadirá por la asociación con Role
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

  // Método para comparar contraseñas
  Usuario.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  return Usuario;
};
