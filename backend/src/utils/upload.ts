import path from 'path';
import multer from 'multer';

// Dossier d'upload commun (backend/uploads)
const uploadDir = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now();
    cb(null, `${base}_${unique}${ext}`);
  },
});

export const upload = multer({ storage });

