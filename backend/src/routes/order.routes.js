const { Router } = require("express");
const { requireAuth } = require("../middlewares/auth.middleware.js");
const { createOrder, getMyOrders, previewOrder, confirmOrder, cancelOrder } = require("../controllers/order.controller.js");

const router = Router();
router.post("/", requireAuth, createOrder);
router.post("/preview", requireAuth, previewOrder);
router.post("/:id/confirm", requireAuth, confirmOrder);
router.post("/cancel", requireAuth, cancelOrder);
router.get("/mine", requireAuth, getMyOrders);
module.exports = router;
