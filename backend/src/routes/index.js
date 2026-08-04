import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as appController from '../controllers/appController.js';
import * as settingsController from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate, schemas } from '../middleware/validate.js';
import uploadRoutes from './uploads.js';

const router = Router();

// Public
router.get('/latest', appController.getLatest);
router.get('/download/track', appController.trackDownload);
router.post('/login', authLimiter, validate(schemas.login), authController.login);

// Authed
router.get('/me', requireAuth, authController.me);
router.put('/me/password', requireAuth, validate(schemas.changePassword), authController.changePassword);
router.put('/me/profile', requireAuth, validate(schemas.updateProfile), authController.updateProfile);

router.get('/app', requireAuth, appController.getAppAdmin);
router.put('/app', requireAuth, appController.updateApp);
router.get('/stats', requireAuth, appController.getStats);

router.get('/settings', requireAuth, settingsController.getSettings);
router.put('/settings', requireAuth, validate(schemas.updateSettings), settingsController.updateSettings);

// Uploads (APK, logo, screenshots) — defined in uploads.js
router.use('/', uploadRoutes);

export default router;
