const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
  const headerName = 'x-request-id';
  req.id = req.headers[headerName.toLowerCase()] || uuidv4();
  res.setHeader(headerName, req.id);
  next();
};
