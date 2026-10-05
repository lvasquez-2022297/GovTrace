import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5433,        
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || 'admin'),
  database: process.env.DB_NAME || 'govtrace_db',   
});

export const conectarDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Conexión exitosa a la base de datos GovTrace');
    client.release();
  } catch (err: any) {
    console.error('Error al conectar a PostgreSQL:', err.message);
    throw err; 
  }
};