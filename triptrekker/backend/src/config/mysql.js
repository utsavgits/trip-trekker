
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "triptrekker",
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();

    console.log("MySQL Connected Successfully!");

    connection.release();
  } catch (error) {
    console.error("MySQL Connection Failed:", error.message);
    throw error;
  }
};

export default pool;
