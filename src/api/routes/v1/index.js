const express = require('express');
const swaggerUi = require('swagger-ui-express');
const convertionRoutes = require('./convert.route');
const { swaggerDocument } = require('../../../config/swagger');

const router = express.Router();

/**
 * GET v1/status Service healthcheck
 */
router.get('/healthcheck', (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'The service is running.',
  });
});

/**
 * GET v1/docs
 */
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

router.use('/convert', convertionRoutes);

module.exports = router;
