const { Router } = require("express");
const { requireAuth } = require("../middlewares/auth.middleware.js");
const { requireAdmin } = require("../middlewares/admin.middleware.js");
const { listLookups, createLookup, updateLookup, deleteLookup } = require("../controllers/lookup.controller.js");

const router = Router();

router.get("/", listLookups);
router.post("/", requireAuth, requireAdmin, createLookup);
router.put("/:id", requireAuth, requireAdmin, updateLookup);
router.delete("/:id", requireAuth, requireAdmin, deleteLookup);

module.exports = router;
