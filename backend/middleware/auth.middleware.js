import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  let token;
  if (
    process.env.NODE_ENV === "development" &&
    req.headers["x-load-test"] === "true"
  ) {
    // We set req.user to the raw number 1
    // This way, 'const userId = req.user' in your controller results in userId = 1
    req.user = 1;
    return next();
  }
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export { protect };
