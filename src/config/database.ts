import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDatabase = async (uri = env.MONGO_URI): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    connectionPromise
      .then(() => {
        logger.info('Connexion MongoDB etablie');
      })
      .catch((error: unknown) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
};

export const disconnectDatabase = async (): Promise<void> => {
  connectionPromise = null;
  await mongoose.disconnect();
  logger.info('Connexion MongoDB fermee');
};
