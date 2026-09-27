import dotenv from 'dotenv';
dotenv.config();

import { conectarDB } from './db';
import { Server } from './server/server';
import { MenuPrincipal } from './menu/MenuPrincipal';

async function bootstrap() {
  try {
    await conectarDB();

    const server = new Server();
    server.listen();

    await new Promise((resolve) => setTimeout(resolve, 300));

    console.clear();
    const menu = new MenuPrincipal();
    await menu.iniciar();
  } catch (error) {
    console.error('Error al iniciar GovTrace:', error);
    process.exit(1);
  }
}

bootstrap();