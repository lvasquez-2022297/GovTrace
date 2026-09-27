export class LoggerUtils {
  static info(mensaje: string): void {
    console.log(`[INFO] [${new Date().toISOString()}] ${mensaje}`);
  }

  static error(mensaje: string, error?: unknown): void {
    console.error(`[ERROR] [${new Date().toISOString()}] ${mensaje}`, error || '');
  }

  static warn(mensaje: string): void {
    console.warn(`[WARN] [${new Date().toISOString()}] ${mensaje}`);
  }
}