import { PORT, HOST } from './config/configEnv.js';
import express, { urlencoded, json } from 'express';
import cookieParser from 'cookie-parser';
import sequelize, { connectDB } from './config/database.js'; 
import { Role, Usuario } from './models/index.js'; 

import indexRoutess from './routes/index.routes.js'; 
import vecinoRoutes from './routes/vecino.routes.js';
import asambleaRoutes from './routes/asamblea.routes.js';
import authRoutes from './routes/auth.routes.js'; 
import userRoutes from './routes/user.routes.js'; 
import { handleFatalError, handleError } from './utils/errorHandler.js';

async function initialSetup() {
  try {
    await sequelize.sync({ alter: true }); 
    console.log('=> Modelos sincronizados con la base de datos.');

    const countRoles = await Role.count();
    if (countRoles === 0) {
      await Role.bulkCreate([
        { name: 'user' },
        { name: 'admin' },
        { name: 'directiva' },
      ]);
      console.log('* => Roles creados exitosamente (user, admin, directiva)');
    }

  } catch (error) {
    handleError(error, 'initialSetup');
  }
}


async function setupServer() {
  try {
    const server = express();
    server.disable('x-powered-by');
    server.use(urlencoded({ extended: true }));
    server.use(json());
    server.use(cookieParser());


    server.use('/api/auth', authRoutes); 
    server.use('/api/users', userRoutes);
    server.use('/api/vecinos', vecinoRoutes);
    server.use('/api/asambleas', asambleaRoutes);


    server.listen(PORT, () => {
      console.log(`=> 🚀 Servidor PERN corriendo en ${HOST}:${PORT}/api`);
    });
  } catch (err) {
    handleError(err, '/server.js -> setupServer');
  }
}

async function main() {
  try {
    await connectDB(); 
    await initialSetup();
    await setupServer();

    console.log('=> ✅ API PERN Iniciada exitosamente');
  } catch (err) {
    handleFatalError(err, '/server.js -> main');
  }
}

main();
