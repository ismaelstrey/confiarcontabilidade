"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/profile', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /users/profile',
    });
});
router.put('/profile', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'PUT /users/profile',
    });
});
router.put('/change-password', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'PUT /users/change-password',
    });
});
router.post('/avatar', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /users/avatar',
    });
});
router.delete('/delete-account', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'DELETE /users/delete-account',
    });
});
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /users',
    });
});
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /users',
    });
});
router.get('/:id', auth_1.authenticate, auth_1.authorizeOwnerOrAdmin, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /users/:id',
    });
});
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'PUT /users/:id',
    });
});
router.patch('/:id/status', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'PATCH /users/:id/status',
    });
});
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'DELETE /users/:id',
    });
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map