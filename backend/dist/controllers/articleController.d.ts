import { Request, Response } from 'express';
export declare class ArticleController {
    static getArticles(req: Request, res: Response): Promise<void>;
    static getArticle(req: Request, res: Response): Promise<void>;
    static createArticle(req: Request, res: Response): Promise<void>;
    static updateArticle(req: Request, res: Response): Promise<void>;
    static deleteArticle(req: Request, res: Response): Promise<void>;
    static getRelatedArticles(req: Request, res: Response): Promise<void>;
    static getPopularArticles(req: Request, res: Response): Promise<void>;
}
export default ArticleController;
//# sourceMappingURL=articleController.d.ts.map