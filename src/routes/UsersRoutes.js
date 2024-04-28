require("dotenv").config();
const express = require("express");
const database = require("../db");
const passport = require("passport");
const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Se o token for inválido, retornar status 403 (Proibido)
    req.user = user; // Armazenar os dados do usuário no objeto req para uso posterior
    next(); // Chamar a próxima função de middleware
  });
}

router.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await database.query("SELECT * FROM users");
    res.json(users.rows);
  } catch (error) {
    console.error("Erro ao obter a lista de usuários:", error);
    res.status(500).json({ error: "Erro ao obter a lista de usuários" });
  }
});

module.exports = router;
