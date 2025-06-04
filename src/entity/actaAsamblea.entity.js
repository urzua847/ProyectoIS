    "use strict";
    import { EntitySchema } from "typeorm";

    const ActaAsambleaSchema = new EntitySchema({
      name: "ActaAsamblea",
      tableName: "actas_asambleas_junta",
      columns: {
        id: {
          type: "int",
          primary: true,
          generated: true,
        },
        contenido: {
          type: "text", 
          nullable: false,
          comment: "Contenido completo del acta o informe de la asamblea.",
        },
        fechaCreacionActa: {
          type: "timestamp with time zone",
          createDate: true,
          default: () => "CURRENT_TIMESTAMP",
          comment: "Fecha en que se registró el acta en el sistema.",
        },
        fechaAprobacion: {
            type: "date",
            nullable: true,
            comment: "Fecha en que el acta fue aprobada (si aplica).",
        },
        estadoActa: {
            type: "varchar",
            length: 50,
            default: "borrador", 
            nullable: false,
            comment: "Estado del acta."
        },
        ultimaModificacionActa: {
          type: "timestamp with time zone",
          updateDate: true,
          default: () => "CURRENT_TIMESTAMP",
          onUpdate: "CURRENT_TIMESTAMP",
        },
      },
      indices: [
        { name: "IDX_ACTA_ESTADO", columns: ["estadoActa"] },
      ],
      relations: {
        asamblea: {
          type: "one-to-one",
          target: "Asamblea", 
          joinColumn: { name: "asambleaId" }, 
                                             // TypeORM creará un unique constraint aquí para la relación 1-a-1
          nullable: false, // Un acta siempre debe estar asociada a una asamblea
          onDelete: "CASCADE",
                               // Alternativa: "RESTRICT" para no permitir borrar asamblea si tiene acta.
          comment: "Asamblea a la que pertenece esta acta.",
        },
        redactor: { // Quién redactó el acta
            type: "many-to-one",
            target: "Vecino",
            joinColumn: { name: "redactorId" },
            nullable: true, // Podría ser un campo de texto si no es un usuario del sistema
            onDelete: "SET NULL",
            comment: "Vecino o miembro de la directiva que redactó el acta."
        }
      },
    });

    export default ActaAsambleaSchema;