import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Asamblea = sequelize.define('Asamblea', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('planificada', 'realizada', 'cancelada'),
      allowNull: false,
      defaultValue: 'planificada',
    },
  }, {
    tableName: 'asambleas',
    timestamps: true,
  });
  return Asamblea;
};
