import { Request, Response } from 'express';
export declare class UploadController {
    static uploadSingle: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static uploadMultiple: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    private static getFileType;
    private static processImage;
    static uploadFile(req: Request, res: Response): Promise<void>;
    static uploadMultipleFiles(req: Request, res: Response): Promise<void>;
    static getFiles(req: Request, res: Response): Promise<void>;
    static getFileById(req: Request, res: Response): Promise<void>;
    static deleteFile(req: Request, res: Response): Promise<void>;
    static deleteMultipleFiles(req: Request, res: Response): Promise<void>;
    static getFileStats(req: Request, res: Response): Promise<void>;
}
export default UploadController;
//# sourceMappingURL=uploadController.d.ts.map