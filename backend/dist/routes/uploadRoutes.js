"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/image', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /upload/image',
    });
});
router.post('/document', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /upload/document',
    });
});
router.post('/multiple', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /upload/multiple',
    });
});
router.get('/', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /upload',
    });
});
router.get('/:id', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /upload/:id',
    });
});
router.get('/:id/download', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /upload/:id/download',
    });
});
router.put('/:id', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'PUT /upload/:id',
    });
});
router.delete('/:id', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'DELETE /upload/:id',
    });
});
router.delete('/cleanup/orphaned', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'DELETE /upload/cleanup/orphaned',
    });
});
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map