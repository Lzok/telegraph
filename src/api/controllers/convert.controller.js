const {
  decodeBits2Morse,
  decodeHuman2Morse,
  translate2Human,
  decodeMorse2HumanDichotomy,
  decodeMorse2Bits,
} = require('../utils/convertion');

exports.bits2morse = (text) => decodeBits2Morse(text);

exports.morse2human = (text, method = 'mappedObj') => {
  const mappedFns = {
    dichotomy: decodeMorse2HumanDichotomy,
    mappedObj: translate2Human,
  };

  return mappedFns[method](text);
};

exports.human2morse = (text) => decodeHuman2Morse(text);

exports.morse2bits = (text, bitLen = 2) => decodeMorse2Bits(text, bitLen);
