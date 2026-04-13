import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import messagesRouter from "./messages";
import translateRouter from "./translate";
import schoolsRouter from "./schools";
import aiRouter from "./ai";
import announcementsRouter from "./announcements";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(messagesRouter);
router.use(translateRouter);
router.use(schoolsRouter);
router.use(aiRouter);
router.use(announcementsRouter);
router.use(adminRouter);

export default router;
