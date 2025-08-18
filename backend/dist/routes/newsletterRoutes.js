"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/subscribe', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /newsletter/subscribe',
    });
});
router.get('/confirm/:token', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /newsletter/confirm/:token',
    });
});
router.get('/unsubscribe/:token', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /newsletter/unsubscribe/:token',
    });
});
router.get('/preferences/:token', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /newsletter/preferences/:token',
    });
});
router.put('/preferences/:token', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'PUT /newsletter/preferences/:token',
    });
});
router.get('/subscribers', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /newsletter/subscribers',
    });
});
router.get('/campaigns', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /newsletter/campaigns',
    });
});
router.post('/campaigns', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /newsletter/campaigns',
    });
});
router.post('/campaigns/:id/send', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /newsletter/campaigns/:id/send',
    });
});
exports.default = router;
//# sourceMappingURL=newsletterRoutes.js.map