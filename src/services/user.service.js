import { Usuario, Role, sequelize } from '../models/index.js';
import { handleError } from '../utils/errorHandler.js';

class UserService {
  async getAllUsers() {
    try {
      const users = await Usuario.findAll({
        attributes: { exclude: ['password'] }, 
        include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
        order: [['username', 'ASC']],
      });
      return [users, null];
    } catch (error) {
      handleError(error, 'user.service -> getAllUsers');
      return [null, 'Error al obtener los usuarios.'];
    }
  }

  async getUserById(id) {
    try {
      const user = await Usuario.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      });
      if (!user) {
        return [null, 'Usuario no encontrado.'];
      }
      return [user, null];
    } catch (error) {
      handleError(error, 'user.service -> getUserById');
      return [null, 'Error al obtener el usuario.'];
    }
  }

  async createUser(userData) {
    const t = await sequelize.transaction();
    try {
      const existingUserByEmail = await Usuario.findOne({ where: { email: userData.email }, transaction: t });
      if (existingUserByEmail) {
        await t.rollback();
        return [null, 'El correo electrónico ya está registrado.'];
      }
      const existingUserByUsername = await Usuario.findOne({ where: { username: userData.username }, transaction: t });
      if (existingUserByUsername) {
        await t.rollback();
        return [null, 'El nombre de usuario ya está en uso.'];
      }

      if (userData.roleId) {
        const roleExists = await Role.findByPk(userData.roleId, { transaction: t });
        if (!roleExists) {
          await t.rollback();
          return [null, 'El rol especificado no existe.'];
        }
      } else {
        const defaultRole = await Role.findOne({ where: { name: 'user' }, transaction: t });
        if (defaultRole) {
          userData.roleId = defaultRole.id;
        } else {
          await t.rollback();
          return [null, 'Rol por defecto "user" no encontrado. Configure los roles iniciales.'];
        }
      }

      const newUser = await Usuario.create(userData, { transaction: t });

      await t.commit();
      const { password, ...userWithoutPassword } = newUser.toJSON();
      return [userWithoutPassword, null];
    } catch (error) {
      await t.rollback();
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return [null, `Error de validación: ${messages}`];
      }
      handleError(error, 'user.service -> createUser');
      return [null, 'Error al crear el usuario.'];
    }
  }

  async updateUser(id, userData) {
     const t = await sequelize.transaction();
    try {
      const user = await Usuario.findByPk(id, { transaction: t });
      if (!user) {
        await t.rollback();
        return [null, 'Usuario no encontrado.'];
      }

      if (userData.email && userData.email !== user.email) {
        const existingUser = await Usuario.findOne({ where: { email: userData.email }, transaction: t });
        if (existingUser) {
          await t.rollback();
          return [null, 'El correo electrónico ya está registrado para otro usuario.'];
        }
      }
      if (userData.username && userData.username !== user.username) {
        const existingUser = await Usuario.findOne({ where: { username: userData.username }, transaction: t });
        if (existingUser) {
          await t.rollback();
          return [null, 'El nombre de usuario ya está en uso por otro usuario.'];
        }
      }
      

      if (userData.roleId && userData.roleId !== user.roleId) {
        const roleExists = await Role.findByPk(userData.roleId, { transaction: t });
        if (!roleExists) {
          await t.rollback();
          return [null, 'El nuevo rol especificado no existe.'];
        }
      }

      await user.update(userData, { transaction: t });
      await t.commit();

      const updatedUser = await Usuario.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      });
      return [updatedUser, null];
    } catch (error) {
      await t.rollback();
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const messages = error.errors.map(e => e.message).join(', ');
        return [null, `Error de validación: ${messages}`];
      }
      handleError(error, 'user.service -> updateUser');
      return [null, 'Error al actualizar el usuario.'];
    }
  }

  async deleteUser(id) {
    try {
      const user = await Usuario.findByPk(id);
      if (!user) {
        return [null, 'Usuario no encontrado.'];
      }
      await user.destroy(); 
      return [{ message: 'Usuario eliminado correctamente.' }, null];
    } catch (error) {
      handleError(error, 'user.service -> deleteUser');
      return [null, 'Error al eliminar el usuario.'];
    }
  }
}

export default new UserService();
