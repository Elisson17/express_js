const pgp = require("pg-promise")();

const database = pgp({
  user: "postgres",
  host: "localhost",
  database: "virgil_development",
  password: "postgres",
  port: 5432,
});

// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "virgil_development",
//   password: "postgres",
//   port: 5432,
// });

// async function testDatabase() {
//   try {
//     // Teste a conexão com o banco de dados
//     await pool.query("SELECT NOW()");
//     console.log("Conexão com o banco de dados estabelecida com sucesso.");

//     // Verifique se a tabela 'users' existe
//     const result = await pool.query(`
//       SELECT EXISTS (
//         SELECT FROM information_schema.tables 
//         WHERE  table_schema = 'public'
//         AND    table_name   = 'users'
//       );
//     `);

//     if (result.rows[0].exists) {
//       console.log('A tabela "users" existe.');
//     } else {
//       console.log('A tabela "users" não existe.');
//     }
//   } catch (error) {
//     console.error("Erro ao testar o banco de dados:", error);
//   } finally {
//     await pool.end();
//   }
// }

// testDatabase();

module.exports = database;
