"use strict";
import Vecino from "../entity/vecino.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./configEnv.js"; 
/**
 * Crea un vecino administrador/directiva inicial si no existe.
 * Utiliza las credenciales definidas en las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD.
 */
async function createAdminVecino() {
  try {
    // Verificar que las credenciales del admin estén configuradas en .env
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.warn("* ADVERTENCIA: No se han configurado ADMIN_EMAIL o ADMIN_PASSWORD en el archivo .env");
      return;
    }

    const vecinoRepository = AppDataSource.getRepository(Vecino);

    // Verificar si el vecino administrador ya existe por email
    const existingAdmin = await vecinoRepository.findOne({ where: { email: ADMIN_EMAIL } });

    if (existingAdmin) {
      return;
    }

    // Si no existe, crear el nuevo vecino administrador/directiva
    const hashedPassword = await encryptPassword(ADMIN_PASSWORD);

    const adminVecinoData = {
      nombres: "Administrador",
      apellidos: "Del Sistema",
      rut: "19.265.584-9", 
      email: ADMIN_EMAIL,
      password: hashedPassword,
      direccion: "Sede Junta de Vecinos",
      rolJunta: "presidente_directiva", 
      esMiembroDirectivaVigente: true,
      cargoDirectiva: "Presidente/a", 
      fechaInicioDirectiva: new Date(), 
      telefonoContacto: "N/A",
    };

    const nuevoAdminVecino = vecinoRepository.create(adminVecinoData);
    await vecinoRepository.save(nuevoAdminVecino);
    console.log(`* => Vecino administrador/directiva (${ADMIN_EMAIL}) creado exitosamente con rol '${adminVecinoData.rolJunta}'.`);

  } catch (error) {
    console.error("Error al crear el vecino administrador/directiva inicial:", error);
  }
}
/**
 * Función principal que se llama desde src/index.js para configurar los datos iniciales.
 */
export async function createInitialData() {

  if (!AppDataSource.isInitialized) {
    console.warn("* ADVERTENCIA: Intentando crear datos iniciales antes de que DataSource esté listo. Esperando inicialización...");

  }

    // Llamar a la función para crear el vecino administrador/directiva inicial
  await createAdminVecino();

}
