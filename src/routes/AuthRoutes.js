require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const database = require("../db");
const passport = require("passport");
const routers = express.Router();

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

// Rota de login FUNCIONA
routers.post("/login", async (req, res) => {
  database
    .one("SELECT * FROM users WHERE email = $1", [req.body.email])
    .then((user) => {
      bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
        if (isMatch) {
          const payload = { sub: user.id };
          const token = generateAccessToken(payload);
          res.json({ token });
        } else {
          res.sendStatus(401);
        }
      });
    })
    .catch((err) => {
      res.sendStatus(401);
    });
});

routers.post("/token", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);

  try {
    const result = await database.query(
      "SELECT * FROM users WHERE refresh_token = $1",
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.sendStatus(403);
    }

    const user = { id: result.rows[0].id, email: result.rows[0].email };
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({ id: user.id });
      res.json({ accessToken: accessToken });
    });
  } catch (error) {
    console.error("Erro ao verificar refresh token no banco de dados:", error);
    return res.status(500).json({ error: "Erro ao verificar refresh token" });
  }
});

// Rota de logout FUNCIONA mais ou menos...
routers.delete(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Remove o refresh token do usuário no banco de dados
      await database.query(
        "UPDATE users SET refresh_token = NULL WHERE id = $1",
        [req.user.id]
      );

      res.json({ message: "Usuário deslogado com sucesso" });
    } catch (error) {
      console.error("Erro ao remover refresh token do banco de dados:", error);
      return res.status(500).json({ error: "Erro ao fazer logout" });
    }
  }
);

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
    const refresh_token = generateRefreshToken(req.body);
    await database.query(
      "INSERT INTO users (email, password, refresh_token) VALUES ($1, $2, $3)",
      [email, hashedPassword, refresh_token]
    );

    res.json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

module.exports = routers;
