const mongoose = require("mongoose");

const neighborSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
    },
    correoElectronico: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/, // Regex básica para email
    },
    direccionContacto: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Neighbor = mongoose.model("Neighbor", neighborSchema);

module.exports = Neighbor;
