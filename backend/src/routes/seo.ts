import { Router } from 'express';
import { getSitemap } from '../controllers/seoController';

const router = Router();

router.get('/sitemap.xml', getSitemap);

export default router;