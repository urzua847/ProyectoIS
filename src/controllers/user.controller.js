import UserService from '../services/user.service.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';
import { handleError } from '../utils/errorHandler.js';
import { createUserSchema, updateUserSchema, userIdSchema } from '../schemas/user.schema.js';

class UserController {
  async getAllUsers(req, res) {
    try {
      const [users, error] = await UserService.getAllUsers();
      if (error) return respondError(req, res, 500, error);
      if (users.length === 0) return respondSuccess(req, res, 204);
      respondSuccess(req, res, 200, users);
    } catch (e) {
      handleError(e, 'user.controller -> getAllUsers');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async getUserById(req, res) {
    try {
      const { error: paramsError } = userIdSchema.validate(req.params);
      if (paramsError) return respondError(req, res, 400, paramsError.details[0].message);

      const { id } = req.params;
      const [user, error] = await UserService.getUserById(id);

      if (error) return respondError(req, res, 404, error); 
      respondSuccess(req, res, 200, user);
    } catch (e) {
      handleError(e, 'user.controller -> getUserById');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async createUser(req, res) {
    try {
      const { error: bodyError } = createUserSchema.validate(req.body);
      if (bodyError) return respondError(req, res, 400, bodyError.details[0].message);

      const [newUser, error] = await UserService.createUser(req.body);
      if (error) return respondError(req, res, 400, error); 
      respondSuccess(req, res, 201, newUser);
    } catch (e) {
      handleError(e, 'user.controller -> createUser');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async updateUser(req, res) {
    try {
      const { error: paramsError } = userIdSchema.validate(req.params);
      if (paramsError) return respondError(req, res, 400, paramsError.details[0].message, { params: paramsError.details });

      const { error: bodyError } = updateUserSchema.validate(req.body);
      if (bodyError) return respondError(req, res, 400, bodyError.details[0].message, { body: bodyError.details });
      
      const { id } = req.params;
      const [updatedUser, error] = await UserService.updateUser(id, req.body);

      if (error) return respondError(req, res, 400, error); 
      respondSuccess(req, res, 200, updatedUser);
    } catch (e) {
      handleError(e, 'user.controller -> updateUser');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }

  async deleteUser(req, res) {
    try {
      const { error: paramsError } = userIdSchema.validate(req.params);
      if (paramsError) return respondError(req, res, 400, paramsError.details[0].message);

      const { id } = req.params;
      const [result, error] = await UserService.deleteUser(id);

      if (error) return respondError(req, res, 404, error);
      respondSuccess(req, res, 200, result); 
    } catch (e) {
      handleError(e, 'user.controller -> deleteUser');
      respondError(req, res, 500, 'Error interno del servidor.');
    }
  }
}

export default new UserController();