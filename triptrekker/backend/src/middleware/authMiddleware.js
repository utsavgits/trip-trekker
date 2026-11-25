
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login first."
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information to request
    req.user = {
      id: decoded.id
    };

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again."
    });
  }
};
