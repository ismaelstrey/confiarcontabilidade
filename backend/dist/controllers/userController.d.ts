import { Request, Response } from 'express';
export declare class UserController {
    static getUsers(req: Request, res: Response): Promise<void>;
    static getUserById(req: Request, res: Response): Promise<void>;
    static createUser(req: Request, res: Response): Promise<void>;
    static updateUser(req: Request, res: Response): Promise<void>;
    static deleteUser(req: Request, res: Response): Promise<void>;
    static getProfile(req: Request, res: Response): Promise<void>;
    static updateProfile(req: Request, res: Response): Promise<void>;
}
export default UserController;
//# sourceMappingURL=userController.d.ts.map