import { Request, Response } from 'express';
export declare class AdminController {
    static getDashboard(req: Request, res: Response): Promise<void>;
    static getSystemStats(req: Request, res: Response): Promise<void>;
    static getSystemLogs(req: Request, res: Response): Promise<void>;
    static clearOldLogs(req: Request, res: Response): Promise<void>;
    static getSystemInfo(req: Request, res: Response): Promise<void>;
    static createBackup(req: Request, res: Response): Promise<void>;
    static getBackups(req: Request, res: Response): Promise<void>;
    static toggleMaintenanceMode(req: Request, res: Response): Promise<void>;
}
export default AdminController;
//# sourceMappingURL=adminController.d.ts.map