import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ApiError } from '../utils/api-error';
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        message: `Route introuvable: ${req.method} ${req.originalUrl}`
    });
};
export const errorHandler = (error, req, res, _next) => {
    logger.error({
        err: error,
        method: req.method,
        path: req.originalUrl
    }, 'Erreur non geree');
    if (error instanceof ApiError) {
        res.status(error.statusCode).json({
            message: error.message,
            details: error.details
        });
        return;
    }
    if (error instanceof ZodError) {
        res.status(400).json({
            message: 'Validation echouee',
            details: error.issues.map((issue) => ({
                champ: issue.path.join('.'),
                message: issue.message
            }))
        });
        return;
    }
    if (error instanceof mongoose.Error.CastError) {
        res.status(400).json({
            message: 'Identifiant invalide'
        });
        return;
    }
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
            message: 'Erreur de validation MongoDB',
            details: Object.values(error.errors).map((err) => ({
                champ: err.path,
                message: err.message
            }))
        });
        return;
    }
    if (error.code === 11000) {
        res.status(409).json({
            message: 'Un candidat avec cet email existe deja'
        });
        return;
    }
    if (error instanceof multer.MulterError) {
        res.status(400).json({
            message: "Erreur lors de l'upload du fichier",
            details: error.message
        });
        return;
    }
    res.status(500).json({
        message: 'Erreur interne du serveur',
        ...(env.NODE_ENV !== 'production' && {
            details: error instanceof Error ? error.message : String(error)
        })
    });
};
