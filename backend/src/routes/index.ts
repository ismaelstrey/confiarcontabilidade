import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import uploadRoutes from './uploadRoutes';
import contactRoutes from './contactRoutes';
import newsletterRoutes from './newsletterRoutes';
import calculatorRoutes from './calculatorRoutes';
import articleRoutes from './articleRoutes';
import adminRoutes from './adminRoutes';
import cacheRoutes from './cacheRoutes';

const router = Router();

// Configurar todas as rotas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/calculator', calculatorRoutes);
router.use('/articles', articleRoutes);
router.use('/admin', adminRoutes);
router.use('/cache', cacheRoutes);

export default router;