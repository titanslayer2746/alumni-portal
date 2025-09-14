import express from "express";
import {
  getUser,
  linkedInCallback,
  logout,
} from "../controllers/auth.controller.js";

const AuthRoutes = express.Router();

AuthRoutes.get("/callback", linkedInCallback);
AuthRoutes.get("/get-user", getUser);
AuthRoutes.post("/logout", logout);
export default AuthRoutes;
