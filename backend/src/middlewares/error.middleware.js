function errorHandler(err, req, res, next) {
  console.error("Error:", err);
  
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation error", details: err.message });
  }
  
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  
  res.status(err.status || 500).json({ 
    message: err.message || "Internal server error" 
  });
}

function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

module.exports = { errorHandler, notFound };
