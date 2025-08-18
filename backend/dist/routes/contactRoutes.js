"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /contact',
    });
});
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /contact',
    });
});
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /contact/:id',
    });
});
router.patch('/:id/status', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'PATCH /contact/:id/status',
    });
});
router.post('/:id/reply', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /contact/:id/reply',
    });
});
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'DELETE /contact/:id',
    });
});
exports.default = router;
//# sourceMappingURL=contactRoutes.js.map