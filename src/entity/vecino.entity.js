"use strict";
import { EntitySchema } from "typeorm";

const VecinoSchema = new EntitySchema({
  name: "Vecino", 
  tableName: "vecinos", 
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombres: {
      type: "varchar",
      length: 150,
      nullable: false,
      comment: "Nombres del vecino",
    },
    apellidos: {
      type: "varchar",
      length: 150,
      nullable: false,
      comment: "Apellidos del vecino",
    },
    rut: {
      type: "varchar",
      length: 12,
      nullable: true, 
      unique: true,
      comment: "RUT del vecino, si aplica",
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false, 
      unique: true,
      comment: "Correo electrónico principal del vecino",
    },
    password: {
      type: "varchar",
      nullable: false,
      comment: "Contraseña para el acceso al sistema (hash)",
    },
    direccion: {
      type: "varchar",
      length: 255,
      nullable: true,
      comment: "Dirección de la vivienda del vecino",
    },
    numeroVivienda: {
      type: "varchar",
      length: 50,
      nullable: true,
      comment: "Número de casa, departamento, sitio, etc.",
    },
    telefonoContacto: {
      type: "varchar",
      length: 20,
      nullable: true,
      comment: "Teléfono de contacto del vecino",
    },
    rolJunta: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "vecino_registrado",
      comment: "Rol del vecino dentro de la junta o el sistema",
    },
    // Campos específicos para miembros de la Directiva
    esMiembroDirectivaVigente: {
      type: "boolean",
      default: false,
      nullable: false,
      comment:
        "Indica si el vecino es actualmente un miembro activo de la directiva.",
    },
    cargoDirectiva: {
      type: "varchar",
      length: 100,
      nullable: true, // Solo aplica si esMiembroDirectivaVigente es true
      comment:
        "Cargo específico en la directiva (Presidente, Secretario, Tesorero, Director).",
    },
    fechaInicioDirectiva: {
      type: "date",
      nullable: true,
      comment: "Fecha en que el vecino inició su período en la directiva.",
    },
    fechaFinDirectiva: {
      type: "date",
      nullable: true,
      comment: "Fecha en que el vecino finaliza su período en la directiva.",
    },
    // Campos de auditoría
    fechaRegistro: {
      type: "timestamp with time zone",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
      comment: "Fecha en que el vecino fue registrado en el sistema",
    },
    ultimaActualizacion: {
      type: "timestamp with time zone",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
      comment: "Última fecha de actualización de los datos del vecino",
    },
  },
  indices: [
    { name: "IDX_VECINO_ID_UNIQUE", columns: ["id"], unique: true },
    { name: "IDX_VECINO_RUT_UNIQUE", columns: ["rut"], unique: true },
    { name: "IDX_VECINO_EMAIL_UNIQUE", columns: ["email"], unique: true },
    { name: "IDX_VECINO_ROL_JUNTA", columns: ["rolJunta"] },
    { name: "IDX_VECINO_ES_DIRECTIVA", columns: ["esMiembroDirectivaVigente"] },
  ],

});

export default VecinoSchema;
