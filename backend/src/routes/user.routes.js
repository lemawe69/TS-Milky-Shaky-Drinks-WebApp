const { Router } = require("express");
const { requireAuth } = require("../middlewares/auth.middleware.js");
const { getProfile, updateProfile } = require("../controllers/user.controller.js");
const { listPaymentMethods, addPaymentMethod, deletePaymentMethod } = require("../controllers/payment.controller.js");

const router = Router();

router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);

router.get('/payment-methods', requireAuth, listPaymentMethods);
router.post('/payment-methods', requireAuth, addPaymentMethod);
router.delete('/payment-methods/:id', requireAuth, deletePaymentMethod);

module.exports = router;
