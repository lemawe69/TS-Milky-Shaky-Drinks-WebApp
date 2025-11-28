const { Router } = require("express");
const { requireAuth } = require("../middlewares/auth.middleware.js");
const { requireAdmin } = require("../middlewares/admin.middleware.js");
const { ordersPerPeriod, topFlavours, customerVolumes, orderStats, auditTrail, weeklyStats, monthlyStats } = require("../controllers/report.controller.js");
const router = Router();

router.get("/orders", requireAuth, requireAdmin, ordersPerPeriod);
router.get("/top-flavours", requireAuth, requireAdmin, topFlavours);
router.get("/customers", requireAuth, requireAdmin, customerVolumes);
router.get("/order-stats", requireAuth, requireAdmin, orderStats);
router.get("/audit", requireAuth, requireAdmin, auditTrail);
router.get("/weekly", requireAuth, requireAdmin, weeklyStats);
router.get("/monthly", requireAuth, requireAdmin, monthlyStats);

module.exports = router;
