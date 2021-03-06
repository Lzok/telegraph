const express = require('express');
const controller = require('../../controllers/convert.controller');
const { receiveBits } = require('../../validations/convert.validation');
const APIError = require('../../utils/APIError');
const logger = require('../../../config/logger');

const router = express.Router();

router.post('/bits/morse', receiveBits, (req, res, next) => {
  const { text } = req.body;

  if (!text.includes('1')) throw new APIError({ message: 'At least one pulse required', status: 400 });

  try {
    const converted = controller.bits2morse(text);

    return res.json({ text: converted });
  } catch (error) {
    logger.error('Error in endpoint /api/v1/experimental/bits/morse.', {
      requestId: req.id,
      error,
    });
    return next(error);
  }
});

module.exports = router;
