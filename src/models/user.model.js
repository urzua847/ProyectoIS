const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../constants/roles.constants");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: { // Añadido para que los miembros de la directiva puedan recibir copias
      type: String,
      unique: true,
      sparse: true, // Permite valores nulos pero aplica unicidad para los no nulos
    },
    roles: [
      {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.NEIGHBOR,
      },
    ],
    // Añade un campo de estado para indicar si un miembro de la directiva está activo/vigente
    status: {
      type: String,
      enum: ["active", "inactive"], // Estados de ejemplo
      default: "active",
    },
    // Otros campos relacionados con el usuario
  },
  {
    timestamps: true,
  },
);

userSchema.statics.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

userSchema.statics.comparePassword = async (password, receivedPassword) => {
  return await bcrypt.compare(password, receivedPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
