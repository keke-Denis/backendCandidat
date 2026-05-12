import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

const handler = async (req: Parameters<typeof app>[0], res: Parameters<typeof app>[1]): Promise<void> => {
  await connectDatabase();
  app(req, res);
};

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Serveur demarre');
  });
};

if (require.main === module) {
  void startServer();
}

export default handler;
