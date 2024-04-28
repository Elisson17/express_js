require("dotenv").config();
const express = require("express");
const database = require("../db");
const passport = require("passport");
const router = express.Router();

router.get("/users", passport.authenticate("jwt"), async (req, res) => {
  try {
    const users = await database.any("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    console.error("Erro ao obter a lista de usuários:", error);
    res.status(500).json({ error: "Erro ao obter a lista de usuários" });
  }
});

module.exports = router;
