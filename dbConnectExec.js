const sql = require("mssql");
const cuisineConfig = require("./config.js");

const config = {
  user: cuisineConfig.DB.user,
  password: cuisineConfig.DB.password,
  server: cuisineConfig.DB.server, // You can use 'localhost\\instance' to connect to named instance
  database: cuisineConfig.DB.database,
};

async function executeQuery(aQuery) {
  let connection = await sql.connect(config);
  let result = await connection.query(aQuery);

  //   console.log(result);
  return result.recordset;
}

// executeQuery(`SELECT *
// FROM Cuisine
// LEFT JOIN Region
// ON REgion.RegionPK = Cuisine.RegionFK`);

module.exports = { executeQuery: executeQuery };
