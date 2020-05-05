const {
  decodeBits2Morse,
  decodeHuman2Morse,
  translate2Human,
  decodeMorse2Bits,
} = require('../utils/convertion');

exports.bits2morse = (text) => decodeBits2Morse(text);

exports.morse2human = (text) => translate2Human(text);

exports.human2morse = (text) => decodeHuman2Morse(text);

exports.morse2bits = (text, bitLen = 2) => decodeMorse2Bits(text, bitLen);
