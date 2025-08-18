import { Request, Response } from 'express';
export declare class ContactController {
    static createContact(req: Request, res: Response): Promise<void>;
    static getContacts(req: Request, res: Response): Promise<void>;
    static getContactById(req: Request, res: Response): Promise<void>;
    static markAsRead(req: Request, res: Response): Promise<void>;
    static markMultipleAsRead(req: Request, res: Response): Promise<void>;
    static replyToContact(req: Request, res: Response): Promise<void>;
    static deleteContact(req: Request, res: Response): Promise<void>;
    static deleteMultipleContacts(req: Request, res: Response): Promise<void>;
    static getContactStats(req: Request, res: Response): Promise<void>;
}
export default ContactController;
//# sourceMappingURL=contactController.d.ts.map