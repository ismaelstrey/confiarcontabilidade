import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<{
    log: ("info" | "error" | "warn" | "query")[];
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
declare const app: import("express-serve-static-core").Express;
export default app;
export { app };
//# sourceMappingURL=server.d.ts.map