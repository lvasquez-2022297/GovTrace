import express, { Application } from 'express';
import cors from 'cors';
import mainRouter from '../router/router';
import { errorHandler } from '../middlewares/errorHandler';
import { LoggerUtils } from '../utils/LoggerUtils';

export class Server {
  private app: Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = Number(process.env.PORT) || port;

    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use('/api', mainRouter);
  }

  private errorHandling(): void {
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      LoggerUtils.info(`Servidor corriendo en http://localhost:${this.port}`);
    });
  }
}