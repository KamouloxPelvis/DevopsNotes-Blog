import { JwtUserPayload } from '../middleware/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}