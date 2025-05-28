import { Sequelize } from 'sequelize';
import { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } from './configEnv.js';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
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

    console.log('=> Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};

export default sequelize;
