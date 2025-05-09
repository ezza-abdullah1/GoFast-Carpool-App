const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  const JWT_SECRET =
    process.env.JWT_SECRET ||
    '8ae74b4cf76c2e91531a6a5e7ed2ef3a62c4dcaee24d7b176fdfd0ba6c1e9abf';

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
