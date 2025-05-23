const mongoose = require("mongoose");

const assemblySchema = new mongoose.Schema(
  {
    fecha: {
      type: Date,
      required: true,
    },
    hora: {
      type: String, // Puede almacenarse como string "HH:MM" o ajustarse a tipo Date
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    organizador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencia al Usuario que la organizó (un miembro de la directiva)
      required: true,
    },
    estado: {
      type: String,
      enum: ["planificado", "realizada", "cancelada"], // Estados de ejemplo
      default: "planificado",
    },
  },
  {
    timestamps: true,
  },
);

const Assembly = mongoose.model("Assembly", assemblySchema);

module.exports = Assembly;
