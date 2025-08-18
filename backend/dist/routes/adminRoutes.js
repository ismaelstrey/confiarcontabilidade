"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/dashboard', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /admin/dashboard',
    });
});
router.get('/system-info', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /admin/system-info',
    });
});
router.get('/activity-logs', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /admin/activity-logs',
    });
});
router.get('/backups', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /admin/backups',
    });
});
router.post('/backups', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /admin/backups',
    });
});
router.get('/backups/:id/download', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /admin/backups/:id/download',
    });
});
router.delete('/backups/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'DELETE /admin/backups/:id',
    });
});
router.get('/settings', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /admin/settings',
    });
});
router.put('/settings', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'PUT /admin/settings',
    });
});
router.post('/cache/clear', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /admin/cache/clear',
    });
});
router.post('/maintenance', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /admin/maintenance',
    });
});
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map