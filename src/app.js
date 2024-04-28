require('dotenv').config();
const authRoutes = require("./routes/AuthRoutes");
const usersRoutes = require("./routes/UsersRoutes")
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const app = express();
require("./guard/passport");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração do middleware express-session
app.use(
  session({
    secret: "ktgDQ2EyEwB2AooOrvNlS3HIAXJVctMBQoX2BDPgqwA=",
    resave: false,
    saveUninitialized: false,
  })
);

// Inicializa o Passport após o middleware express-session
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", authRoutes);
app.use("/api/v1", usersRoutes);


app.get("/", (req, res) => {
  res.send("Bem-vindo seu merda, sua mamãe mi espera");
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
