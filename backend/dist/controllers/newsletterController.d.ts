import { Request, Response } from 'express';
export declare class NewsletterController {
    static subscribeValidation: any[];
    static campaignValidation: any[];
    static subscribe(req: Request, res: Response): Promise<void>;
    static confirmSubscription(req: Request, res: Response): Promise<void>;
    static unsubscribe(req: Request, res: Response): Promise<void>;
    static getSubscribers(req: Request, res: Response): Promise<void>;
    static createCampaign(req: Request, res: Response): Promise<void>;
    static getCampaigns(req: Request, res: Response): Promise<void>;
    static sendCampaign(req: Request, res: Response): Promise<void>;
    static getNewsletterStats(req: Request, res: Response): Promise<void>;
}
export default NewsletterController;
//# sourceMappingURL=newsletterController.d.ts.map