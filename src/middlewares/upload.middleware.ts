import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadDirectory = path.resolve(process.cwd(), 'uploads', 'candidates');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${baseName}${extension}`);
  }
});

export const uploadCandidateFile = multer({ storage }).single('fichier');
