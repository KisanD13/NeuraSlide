import { Router } from "express";
import { AccountController } from "./accountController";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();
const accountController = new AccountController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Profile Management Routes
router.get("/profile", accountController.getProfile.bind(accountController));
router.put("/profile", accountController.updateProfile.bind(accountController));
router.put(
  "/password",
  accountController.changePassword.bind(accountController)
);

// Settings Management Routes
router.get("/settings", accountController.getSettings.bind(accountController));
router.put(
  "/settings",
  accountController.updateSettings.bind(accountController)
);

// Activity Tracking Routes
router.get("/activity", accountController.getActivity.bind(accountController));

// Account Statistics Routes
router.get("/stats", accountController.getStats.bind(accountController));

// Account Deletion Routes
router.delete(
  "/account",
  accountController.deleteAccount.bind(accountController)
);

// Data Export Routes
router.post(
  "/export",
  accountController.requestDataExport.bind(accountController)
);
router.get(
  "/exports",
  accountController.getDataExports.bind(accountController)
);

export default router;
