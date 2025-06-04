"use strict";
import passport from "passport";
import Vecino from "../entity/Vecino.entity.js"; 
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import { AppDataSource } from "../config/configDb.js";

// Opciones para la estrategia JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

const strategy = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const vecinoRepository = AppDataSource.getRepository(Vecino);
    const vecinoEncontrado = await vecinoRepository.findOne({
      where: {
        id: jwt_payload.id,
      },
      select: ["id", "nombres", "apellidos", "email", "rolJunta", "esMiembroDirectivaVigente", "cargoDirectiva"],
    });

    if (vecinoEncontrado) {
      return done(null, vecinoEncontrado);
    } else {
      return done(null, false, { message: "Vecino no encontrado o token ya no es válido para este usuario." });
    }
  } catch (error) {
    console.error("Error en la estrategia JWT de Passport:", error); 
    return done(error, false);
  }
});

passport.use("jwt-vecino", strategy);

export function passportJwtSetup() {
}

