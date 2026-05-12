export const prepareCandidateBody = (req, _res, next) => {
    if (req.file) {
        req.body.fichier = req.file.path;
    }
    next();
};
