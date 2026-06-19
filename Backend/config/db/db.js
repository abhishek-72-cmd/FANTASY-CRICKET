const mysql = require ('mysql2');
require ('dotenv').config();
const fs = require ('fs');
 const path = require ('path');

const caPath = path.join(__dirname, 'isrgrootx1.pem');

console.log(caPath);

console.log(
  fs.existsSync(
    path.join(__dirname, 'isrgrootx1.pem')
  )
);


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT  || 3306,
  connectionLimit: 10,
   connectTimeout: 10000, //10 sec
   ssl: {
  ca: fs.readFileSync(caPath)
}
   
})



module.exports = pool.promise();