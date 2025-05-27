// src/server.js
import { PORT, HOST } from './config/configEnv.js';
import express, { urlencoded, json } from 'express';
import cookieParser from 'cookie-parser';

// Importar conexión a la BD (PostgreSQL con Sequelize)
import sequelize, { connectDB } from './config/database.js'; // sequelize importado para inicializar modelos
import { Role, Usuario } from './models/index.js'; // Importar modelos para setup inicial

// Importar rutas
import indexRoutess from './routes/index.routes.js'; // Tu enrutador principal
import vecinoRoutes from './routes/vecino.routes.js';
import asambleaRoutes from './routes/asamblea.routes.js';
// Tus rutas de auth y user necesitarán ser adaptadas para Sequelize también.
import authRoutes from './routes/auth.routes.js'; // Asumiendo que lo adaptarás
import userRoutes from './routes/user.routes.js'; // Asumiendo que lo adaptarás

// Importar manejadores de errores
import { handleFatalError, handleError } from './utils/errorHandler.js';
// Importar setup inicial (adaptado para Sequelize)
// import { createRoles, createUsers } from './config/initialSetup.js'; // Lo adaptaremos abajo

/**
 * Crea roles y usuarios por defecto si no existen (adaptado para Sequelize).
 */
async function initialSetup() {
  try {
    // Sincronizar modelos (crear tablas si no existen)
    // Es mejor hacerlo aquí después de definir todas las asociaciones.
    // Para desarrollo puedes usar alter: true o force: true (CUIDADO: force borra datos)
    // Para producción, usa migraciones.
    await sequelize.sync({ alter: true }); // o sequelize.sync();
    console.log('=> Modelos sincronizados con la base de datos.');

    // Crear Roles
    const countRoles = await Role.count();
    if (countRoles === 0) {
      await Role.bulkCreate([
        { name: 'user' },
        { name: 'admin' },
        { name: 'directiva' }, // Nuevo rol para miembros de la directiva si lo prefieres a campos booleanos
      ]);
      console.log('* => Roles creados exitosamente (user, admin, directiva)');
    }

    // Crear Usuario Admin por defecto
    const countUsers = await Usuario.count({ where: { email: 'admin@example.com' } });
    if (countUsers === 0) {
      const adminRole = await Role.findOne({ where: { name: 'admin' } });
      if (adminRole) {
        await Usuario.create({
          username: 'Administrador',
          email: 'admin@example.com',
          password: 'adminpassword', // La contraseña se hasheará por el hook del modelo
          rut: '11111111-1',
          roleId: adminRole.id,
          esDirectiva: true, // Un admin puede ser parte de la directiva
          directivaVigente: true,
          directivaCargo: 'Admin Supremo',
        });
        console.log('* => Usuario Administrador creado exitosamente');
      }
    }
     // Crear Usuario Directiva por defecto
    const countDirectiva = await Usuario.count({ where: { email: 'directiva@example.com' } });
    if (countDirectiva === 0) {
      const directivaRole = await Role.findOne({ where: { name: 'directiva' } }); // O usa el rol 'user' y los campos booleanos
      if (directivaRole) {
        await Usuario.create({
          username: 'Miembro Directiva',
          email: 'directiva@example.com',
          password: 'directivapassword',
          rut: '22222222-2',
          roleId: directivaRole.id,
          esDirectiva: true,
          directivaVigente: true,
          directivaCargo: 'Secretario/a',
        });
        console.log('* => Usuario Directiva de ejemplo creado exitosamente');
      }
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

    // Rutas principales (ya tienes /api prefijado en tu indexRoutes)
    // server.use('/api', indexRoutes); // Si indexRoutes ya maneja /auth y /users

    // O define las rutas específicas aquí si prefieres
    server.use('/api/auth', authRoutes); // Adaptar auth.routes.js y su controller/service
    server.use('/api/users', userRoutes); // Adaptar user.routes.js y su controller/service
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
    // 1. Conectar a la base de datos PostgreSQL
    await connectDB(); // Esta función ahora también sincroniza modelos

    // 2. (Opcional pero recomendado) Setup inicial de roles/usuarios
    await initialSetup();

    // 3. Iniciar el servidor Express
    await setupServer();

    console.log('=> ✅ API PERN Iniciada exitosamente');
  } catch (err) {
    handleFatalError(err, '/server.js -> main');
  }
}

main();
