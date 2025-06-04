    "use strict";
    import { EntitySchema } from "typeorm";

    const AsambleaSchema = new EntitySchema({
      name: "Asamblea",
      tableName: "asambleas_junta",
      columns: {
        id: {
          type: "int",
          primary: true,
          generated: true,
        },
        titulo: { 
            type: "varchar",
            length: 255,
            nullable: false,
            comment: "Título o motivo principal de la asamblea",
        },
        descripcionOrdenDia: { 
          type: "text",
          nullable: true,
          comment: "Descripción de los puntos a tratar o el orden del día.",
        },
        fechaHora: {
          type: "timestamp with time zone",
          nullable: false,
          comment: "Fecha y hora programada para la asamblea.",
        },
        lugar: {
            type: "varchar",
            length: 255,
            nullable: true, 
            comment: "Lugar donde se realizará la asamblea (ej. Sede Social, Zoom Link).",
        },
        estado: {
          type: "varchar",
          length: 50,
          nullable: false,
          default: "planificada",
          comment: "Estado actual de la asamblea.",
        },
        // Campos de auditoría
        fechaCreacion: {
          type: "timestamp with time zone",
          createDate: true,
          default: () => "CURRENT_TIMESTAMP",
        },
        fechaUltimaModificacion: {
          type: "timestamp with time zone",
          updateDate: true,
          default: () => "CURRENT_TIMESTAMP",
          onUpdate: "CURRENT_TIMESTAMP",
        },
      },
      indices: [
        { name: "IDX_ASAMBLEA_FECHAHORA", columns: ["fechaHora"] },
        { name: "IDX_ASAMBLEA_ESTADO", columns: ["estado"] },
      ],
      relations: {
        organizador: {
          type: "many-to-one",
          target: "Vecino", // Se relaciona con la entidad Vecino
          joinColumn: { name: "organizadorId" }, // FK en la tabla 'asambleas_junta'
          nullable: false, // Una asamblea debe tener un organizador (miembro de directiva)
          onDelete: "RESTRICT", // No permitir eliminar un vecino si ha organizado asambleas (o SET NULL si es opcional)
          comment: "Miembro de la directiva que organiza la asamblea.",
        },
        acta: { // Relación con el acta/informe de la asamblea
            type: "one-to-one", // Usualmente una asamblea tiene una sola acta principal
            target: "ActaAsamblea", // Nombre de la entidad ActaAsamblea
            inverseSide: "asamblea", // Propiedad en ActaAsamblea que referencia a Asamblea
            nullable: true, // El acta se puede crear después de la asamblea
            cascade: ["insert", "update"], // Si se guarda la asamblea con un acta, se guarda el acta.
        }
      },
    });

    export default AsambleaSchema;