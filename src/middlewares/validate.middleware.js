import { logger } from '../config/logger';
export const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        logger.error({ body: req.body, errors: result.error.issues }, 'Validation failed');
        res.status(400).json({
            message: 'Validation echouee',
            details: result.error.issues.map((issue) => ({
                champ: issue.path.join('.'),
                message: issue.message
            }))
        });
        return;
    }
    req.body = result.data;
    next();
};
