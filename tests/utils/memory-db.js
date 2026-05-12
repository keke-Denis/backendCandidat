import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
let mongoServer = null;
export const connectMemoryDatabase = async () => {
    mongoServer = await MongoMemoryServer.create({
        instance: {
            launchTimeout: 30000
        }
    });
    await mongoose.connect(mongoServer.getUri());
};
export const clearMemoryDatabase = async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
};
export const disconnectMemoryDatabase = async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
};
