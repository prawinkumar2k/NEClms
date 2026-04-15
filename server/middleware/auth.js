import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_keep_it_safe";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Normalize user object for consistency
    req.user = {
      ...decoded,
      id: decoded.id || decoded._id,
      dept: decoded.dept || decoded.department
    };
    
    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const roleMiddleware = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Higher authority required" });
  }
  next();
};
