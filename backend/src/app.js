const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes.js");
const orderRoutes = require("./routes/order.routes.js");
const lookupRoutes = require("./routes/lookup.routes.js");
const userRoutes = require("./routes/user.routes.js");
const reportRoutes = require("./routes/report.routes.js");

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/lookups", lookupRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

module.exports = app;
