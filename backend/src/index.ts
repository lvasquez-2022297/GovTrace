import dotenv from 'dotenv';
dotenv.config();

import { conectarDB } from './db';
import { Server } from './server/server';
import { MenuPrincipal } from './menu/MenuPrincipal';
import { analizadorRiesgo } from './services/AnalizadorRiesgoService';

async function bootstrap() {
  try {
    await conectarDB();

    const server = new Server();
    server.listen();

    // Ejecutar analizador de riesgo al inicio (no bloqueante con el menú)
    // Ejecutar una pasada inicial y arrancar scheduler (configurable vía ANALYZER_INTERVAL_MS en ms)
    await analizadorRiesgo.ejecutarAnalisisContinuo();
    const envMs = Number(process.env.ANALYZER_INTERVAL_MS || '0');
    const intervalo = Number.isFinite(envMs) && envMs > 0 ? envMs : 1000 * 60 * 5;
    analizadorRiesgo.startScheduler(intervalo);

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