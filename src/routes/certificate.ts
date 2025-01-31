import { Router } from "express";
import protectRoute from "../middleware/auth";
import { certificate, getAllCertificate } from "../controllers/Certificate.controller";

const router = Router();

router.post("/create",protectRoute(), certificate);
router.post("/:id", protectRoute(), getAllCertificate);
export default router;
