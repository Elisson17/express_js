require('dotenv').config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const database = require("../db");
const passport = require("passport");
const routers = express.Router();

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
}

// Rota de login FUNCIONA
routers.post("/login", passport.authenticate("local"), async (req, res) => {
  const user = { id: req.user.id, email: req.user.email };
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  try {
    await database.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user.id,
    ]);
  } catch (error) {
    console.error("Erro ao salvar refresh token no banco de dados:", error);
    return res.status(500).json({ error: "Erro ao salvar refresh token" });
  }

  res.json({ user: req.user, token: accessToken });
});

routers.post("/token", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  try {
    const result = await database.query(
      "SELECT * FROM users WHERE refresh_token = $1",
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.sendStatus(403);
    }

    const user = { id: result.rows[0].id, email: result.rows[0].email };
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (error) {
    console.error("Erro ao verificar refresh token no banco de dados:", error);
    return res.status(500).json({ error: "Erro ao verificar refresh token" });
  }
});

// Rota de logout FUNCIONA mais ou menos...
routers.post("/logout", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }
  const userId = req.user.id;

  try {
    // Remove o refresh token do usuário no banco de dados
    await database.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [
      userId,
    ]);

    res.json({ message: "Usuário deslogado com sucesso" });
  } catch (error) {
    console.error("Erro ao remover refresh token do banco de dados:", error);
    return res.status(500).json({ error: "Erro ao fazer logout" });
  }
});


// Rota de registro FuncionA
routers.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await database.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await database.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hashedPassword]
    );

    res.json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

module.exports = routers;
