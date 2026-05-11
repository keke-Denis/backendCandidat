import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Serveur demarre');
  });
};

void startServer();
