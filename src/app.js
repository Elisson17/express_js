require('dotenv').config();
const authRoutes = require("./routes/AuthRoutes");
const usersRoutes = require("./routes/UsersRoutes")
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const app = express();
require("./guard/passport");

app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(express.json());

app.use(passport.initialize());

app.use("/api/v1", authRoutes);
app.use("/api/v1", usersRoutes);


app.get("/", (req, res) => {
  res.send("Bem-vindo seu merda, sua mamãe mi espera");
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
