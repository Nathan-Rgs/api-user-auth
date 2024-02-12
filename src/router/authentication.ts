import express from "express";
import {
  login,
  register,
  validateRegister,
} from "../controllers/authentication";

export default (router: express.Router) => {
  router.post("/auth/register", validateRegister, register);
  router.post("/auth/login", login);
};
