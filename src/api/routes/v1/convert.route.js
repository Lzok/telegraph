const express = require('express');
const controller = require('../../controllers/convert.controller');
const {
  receiveAlphanum,
  receiveBits,
  receiveMorse,
  receiveMorseWithOptQuery,
} = require('../../validations/convert.validation');
const APIError = require('../../utils/APIError');

const router = express.Router();

router.post('/bits/morse', receiveBits, (req, res, next) => {
  const { text } = req.body;

  if (!text.includes('1')) throw new APIError({ message: 'At least one pulse required', status: 400 });

  try {
    const converted = controller.bits2morse(text);

    return res.json({ text: converted });
  } catch (error) {
    return next(error);
  }
});

router.post('/morse/human', receiveMorse, (req, res, next) => {
  const { text } = req.body;

  try {
    const converted = controller.morse2human(text);

    return res.json({ text: converted });
  } catch (error) {
    return next(error);
  }
});

router.post('/morse/bits', receiveMorseWithOptQuery, (req, res, next) => {
  const { text } = req.body;
  const { bitLength } = req.query;

  try {
    const converted = controller.morse2bits(text, bitLength);

    return res.json({ text: converted });
  } catch (error) {
    return next(error);
  }
});

router.post('/human/morse', receiveAlphanum, (req, res, next) => {
  const { text } = req.body;

  try {
    const converted = controller.human2morse(text);

    return res.json({ text: converted });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
