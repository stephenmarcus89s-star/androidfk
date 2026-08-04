import { Router } from 'express';
import { uploadApk, uploadLogo, uploadScreenshot } from '../config/upload.js';
import * as uploadController from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimit.js';

const router = Router();

// All upload routes require auth
router.use(requireAuth, uploadLimiter);

router.post('/upload-apk', uploadApk.single('apk'), uploadController.uploadApkHandler);
router.post('/upload-logo', uploadLogo.single('logo'), uploadController.uploadLogoHandler);
router.post('/upload-screenshot', uploadScreenshot.single('screenshot'), uploadController.uploadScreenshotHandler);
router.delete('/screenshot/:id', uploadController.deleteScreenshot);
router.delete('/version/:id', uploadController.deleteVersion);

export default router;
