const errorHandler = (err, req, res, next) => {
  console.error("💥 Error caught by middleware:", err.message);
  
  // Optional: check for specific MongoDB errors
  if (err.name === "MongoError" || err.name === "MongooseError") {
    return res.status(500).json({ message: "Database error occurred" });
  }

  // For validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  // Default fallback error
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong",
  });
};

export default errorHandler;
