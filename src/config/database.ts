import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export const connectDatabase = async (uri = env.MONGO_URI): Promise<void> => {
  await mongoose.connect(uri);
  logger.info({ uri }, 'Connexion MongoDB etablie');
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('Connexion MongoDB fermee');
};
