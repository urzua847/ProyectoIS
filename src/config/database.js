import { Sequelize } from 'sequelize';
import { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } from './configEnv.js'; // Asumiendo que tienes estas variables en tu configEnv.js

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false, // Puedes poner console.log para ver las queries SQL
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('=> ✅ Conectado a PostgreSQL.');
    // Sincronizar modelos (crear tablas si no existen)
    // En un entorno de producción, podrías querer usar migraciones en lugar de sync({ force: true }) o sync({ alter: true })
    // await sequelize.sync({ force: false }); // force: true borrará y recreará las tablas
    // await sequelize.sync({ alter: true }); // alter: true intentará modificar las tablas para que coincidan con los modelos
    console.log('=> Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    process.exit(1); // Termina el proceso si no se puede conectar a la BD
  }
};

export default sequelize;
