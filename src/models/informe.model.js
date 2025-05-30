import sequelize, { DataTypes} from 'sequelize';

export default (sequelize) => {
    const Informe = sequelize.define('Informe',{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoincrement: true,
        },

        tituloinforme: {
            type: DataTypes. STRING,
            allownull: false,
            validate: {
                notEmpty: {
                    msg: 'El titulo no puede estar vacio',
                },
            },
        },

        ingresos: {
            type: DataTypes.INTEGER,
            allownull: false,
            validate: {
                notEmpty: {
                    msg: 'Los ingresos no pueden ser nulos',
                },
            },
        },

        perdidas: {
            type: DataTypes.INTEGER,
            allownull: false,
            validate: {
                notEmpty:{
                    msg: 'Las perdidas no pueden ser nulas',
                },
            },
        },
    }, {
        tablename: 'Informes',
        timestamps: true,
    });
    return Informe;
};