const mysql = require ('mysql2');
require ('dotenv').config();


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT  || 3306,
  connectionLimit: 10,
   connectTimeout: 10000, //10 sec
})


pool.getConnection ((err,connection)=>{
    if(err){
        console.log (`MySQL connection failed`, err.message)
    } else {
        console.log (`MySQL connection successful`)
         connection.release();
    }
})

module.exports = pool.promise();