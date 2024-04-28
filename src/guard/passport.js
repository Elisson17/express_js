const passport = require("passport");
const bcrypt = require("bcrypt");
const database = require("../db");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    try {
      const result = await database.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return done(null, false, { message: "Usuário não encontrado" });
      }

      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return done(null, false, { message: "Senha incorreta" });
      }

      return done(null, user);
    } catch (err) {
      console.error("Erro ao conectar ao banco de dados:", err);
      return done(err);
    }
  })
);

// Serialização e desserialização do usuário (necessário para sessions)
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  database.query("SELECT * FROM users WHERE id = $1", [id], (err, res) => {
    if (err) {
      console.error("Erro ao conectar ao banco de dados:", err);
      return done(err);
    }

    if (res.rows.length === 0) {
      // Usuário não encontrado
      return done(null, false);
    }

    const user = res.rows[0];
    return done(null, user);
  });
});
