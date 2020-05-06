const Joi = require('@hapi/joi');
const { BITSTRING, MORSESTRING, ALPHANUM_SPACE_PERIOD } = require('../../constants/regexes');

const receiveBitsSchema = Joi.object({
  text: Joi.string()
    .pattern(BITSTRING)
    .required(),
}).unknown(false);

const receiveMorseSchema = Joi.object({
  text: Joi.string()
    .pattern(MORSESTRING)
    .required(),
}).unknown(false);

const receiveAlphanumSchema = Joi.object({
  text: Joi.string()
    .pattern(ALPHANUM_SPACE_PERIOD)
    .required(),
}).unknown(false);

const bitLengthQSchema = Joi.object({
  bitLength: Joi.number().min(1),
}).unknown(false);

const methodMorseSchema = Joi.object({
  method: Joi.string()
    .valid('dichotomy', 'mappedObj')
    .default('mappedObj'),
}).unknown(false);

const receiveBits = async (req, res, next) => {
  try {
    await receiveBitsSchema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  return next();
};

const receiveMorse = async (req, res, next) => {
  try {
    await Promise.all([
      receiveMorseSchema.validateAsync(req.body),
      methodMorseSchema.validateAsync(req.query),
    ]);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  return next();
};

const receiveMorseWithOptQuery = async (req, res, next) => {
  try {
    await Promise.all([
      receiveMorseSchema.validateAsync(req.body),
      bitLengthQSchema.validateAsync(req.query),
    ]);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  return next();
};

const receiveAlphanum = async (req, res, next) => {
  try {
    await receiveAlphanumSchema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  return next();
};

module.exports = {
  receiveBits,
  receiveMorse,
  receiveAlphanum,
  receiveMorseWithOptQuery,
};
