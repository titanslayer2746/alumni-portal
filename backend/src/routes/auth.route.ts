import express from "express";
import {
  getUser,
  linkedInCallback,
  logout,
  updateUserProfile,
} from "../controllers/auth.controller.js";

const AuthRoutes = express.Router();

AuthRoutes.get("/callback", linkedInCallback);
AuthRoutes.get("/get-user", getUser);
AuthRoutes.post("/logout", logout);
AuthRoutes.patch("/update-profile", updateUserProfile);
export default AuthRoutes;
