const { decodeBits2MorseKM } = require('../utils/kmeans');

exports.bits2morse = (text) => decodeBits2MorseKM(text);
