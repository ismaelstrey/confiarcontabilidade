"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/income-tax', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /calculator/income-tax',
    });
});
router.post('/company-tax', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /calculator/company-tax',
    });
});
router.post('/payroll', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /calculator/payroll',
    });
});
router.post('/simples-nacional', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /calculator/simples-nacional',
    });
});
router.post('/depreciation', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /calculator/depreciation',
    });
});
router.post('/loan', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /calculator/loan',
    });
});
exports.default = router;
//# sourceMappingURL=calculatorRoutes.js.map