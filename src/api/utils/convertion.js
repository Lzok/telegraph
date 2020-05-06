const {
  DIT,
  DAH,
  INTRASEP,
  CHARSEP,
  WORDSEP,
  FULLSTOP,
  MORSE2ALPHA,
  ALPHA2MORSE,
  MORSETREE,
} = require('../../constants/morse');
const { SEPARATEPULSES } = require('../../constants/regexes');

function getOccurrenceExtreme(arr) {
  const lengths = arr.map((x) => x.length);
  return [Math.min(...lengths), Math.max(...lengths)];
}

function getAverage(arr) {
  return Math.round(arr.reduce((acc, cur) => acc + cur.length, 0) / arr.length);
}

function partitionPulses(pulses) {
  const [zeros, ones] = pulses.reduce(
    (acc, cur) => (cur[0] === '0' ? [[...acc[0], cur], acc[1]] : [acc[0], [...acc[1], cur]]),
    [[], []],
  );

  return [zeros, ones];
}

function getCfgPerfectTiming(bitLength) {
  return {
    bitLen: bitLength,
    limitDot: bitLength * 3,
    charsepLen: bitLength * 3,
    wordSepLen: bitLength * 7,
  };
}

function checkIfTimingIsPerfect(zeroPulses, onePulses) {
  const minBit = Math.min(...onePulses.map((p) => p.length));
  const { bitLen, charsepLen, wordSepLen } = getCfgPerfectTiming(minBit);

  const areZerosImperfect = zeroPulses.some((p) => {
    const l = p.length;
    return l !== bitLen && l !== charsepLen && l !== wordSepLen;
  });

  // Early return
  if (areZerosImperfect) return false;

  const areOnesImperfect = onePulses.some((p) => {
    const l = p.length;
    return l !== bitLen && l !== charsepLen;
  });

  return !areOnesImperfect;
}

/**
 * Check the given morse in case it has a full stop character
 * so we can crop it (end of the message for the test purposes)
 * and return the part to compute.
 * I assume if there is no full stop character, the morse message
 * lasts all its length.
 * It would be great to implement some sort of mechanism to "hear"
 * the pulses and calculate a long pause based on a long "silence".
 *
 * @param {string} morseStr - A morse string to be processed.
 * @return {string} Morse string to be converted.
 */
function getMessageToProcess(morseStr) {
  const periodExist = morseStr.indexOf(FULLSTOP);

  return `${morseStr.split(FULLSTOP)[0]}${periodExist > -1 ? FULLSTOP : ''}`;
}

/**
 * @typedef {Object} Peaks
 * @property {number} minzeroLen - Minimum length of zero pulses
 * @property {number} maxzeroLen - Maximum length of zero pulses
 * @property {number} minoneLen - Minimum length of one pulses
 * @property {number} maxoneLen - Maximum length of one pulses
 */

/**
 * @typedef {Object} PulsesData
 * @property {number} avgzero - The X Coordinate
 * @property {number} avgone - The Y Coordinate
 * @property {boolean} isTimingPerfect - The Y Coordinate
 * @property {Peaks} peaks - Some peaks of the pulses
 */

/**
 * Get some useful data from the pulses for later use.
 *
 * @param {string} pulses - An array of pulses of 0s and 1s like ['000', '111', '00']
 * @return {PulsesData} Useful data about the pulses to be used later.
 */
function getPulsesData(pulses) {
  const [zeros, ones] = partitionPulses(pulses);
  const isTimingPerfect = checkIfTimingIsPerfect(zeros, ones);

  const [minzeroLen, maxzeroLen] = getOccurrenceExtreme(zeros);
  const [minoneLen, maxoneLen] = getOccurrenceExtreme(ones);

  const avgzero = getAverage(zeros);
  const avgone = getAverage(ones);

  return {
    avgzero,
    avgone,
    isTimingPerfect,
    peaks: {
      minzeroLen,
      maxzeroLen,
      minoneLen,
      maxoneLen,
    },
  };
}

/**
 * Based on the pulse and the "bits config", return the correspond element in morse.
 *
 * @param {string} pulse - A pulse e.g '1111'
 * @param {Object} cfgObj - The "configuration" for the transmission's bit.
 * @param {number} cfgObj.limitDot - Limit value (not inclusive) to return a dot.
 * @param {number} cfgObj.charsepLen - Limit value (not inclusive) to return an intrasep.
 * @param {number} cfgObj.wordSepLen - Limit value (inclusive) to return a wordsep.
 * @return {string} The corresponding morse element -> .|-| |   |.
 */
function getElement(pulse, cfgObj) {
  const pulseType = pulse[0];
  const pulseLen = pulse.length;

  if (pulseType === '1') {
    if (pulseLen < cfgObj.limitDot) return DIT;
    return DAH;
  }
  if (pulseLen < cfgObj.charsepLen) return INTRASEP;
  if (pulseLen >= cfgObj.wordSepLen) return WORDSEP;
  return CHARSEP;
}

/**
 * Get rid of first and last zero pulses if there were any.
 *
 * @param {string[]} pulses - An array of pulses of 0s and 1s like ['000', '111', '00']
 * @return {string[]} Array of pulses without leading or final zero elements.
 */
function cleanPulses(pulses) {
  return pulses.reduce(
    (acc, cur, idx, arr) => ((idx === 0 || arr.length - 1 === idx) && arr[idx].includes('00') ? acc : [...acc, cur]),
    [],
  );
}

function getBitsCfg({ isTimingPerfect, peaks }) {
  const {
    minoneLen, maxoneLen, minzeroLen, maxzeroLen,
  } = peaks;

  if (isTimingPerfect) return getCfgPerfectTiming(minoneLen);

  // Just some arbitrary "threshold". TODO enhance this with math.
  const wordSepLen = minoneLen * 7 - 2;

  // Estimated value to limit intra sep and char sep
  const charsepLen = Math.round((minzeroLen + maxzeroLen) / 2);
  // const charsepLen = Math.round(maxzeroLen / 3);

  // Estimated value to limit dot and dash
  const limitDot = Math.round((minoneLen + maxoneLen) / 2);

  return {
    wordSepLen,
    limitDot,
    charsepLen,
    bitLen: minoneLen,
  };
}

/**
 * Given a morse code string, translates it into a human readable string.
 *
 * @param {string} morse - String of morse code string to be converted into Human readable.
 * @return {string} string human readable
 */
function translate2Human(morse) {
  const str = getMessageToProcess(morse);
  const h = str
    .trim()
    .split('   ')
    .map((codes) => codes
      .split(' ')
      .map((c) => MORSE2ALPHA[c])
      .join(''))
    .join(' ');

  return h;
}

/**
 * Given a string "human readable", translates it into morse code.
 *
 * @param {string} str - String human readable to be converted into Morse
 * @return {string} string in morse
 */
function decodeHuman2Morse(str) {
  const m = str
    .trim()
    .toUpperCase()
    .split(' ')
    .map((word) => word
      .split('')
      .map((char) => ALPHA2MORSE[char])
      .join(' '))
    .join('   ');

  return m;
}

/**
 * Given a string of bits, translates it into morse code.
 * The bits may be in perfect or imperfect timing
 *
 * @param {string} bits - String of bits
 * @return {string} string in morse
 */
function decodeBits2Morse(bits) {
  const pulsesRaw = bits.match(SEPARATEPULSES);
  const pulses = cleanPulses(pulsesRaw);
  const pulsesData = getPulsesData(pulses);
  const bitsCfg = getBitsCfg(pulsesData);

  const acc = pulses.map((p) => getElement(p, bitsCfg)).join('');

  return acc;
}

/**
 * @typedef {Object} MapMorseBits
 * @property {string} intraSep - Intra morse mark space
 * @property {string} dit - Morse dot mark
 * @property {string} dah - Morse dash mark
 * @property {string} charSep - Char separator
 * @property {string} wordSep - Word separator
 * @property {string} remainingPause - Remaining pause to attach to a string
 */

/**
 * @typedef {Object} CfgEncodeBits
 * @property {string} intraSep - Intra morse mark space
 * @property {string} charSep - Char separator
 * @property {MapMorseBits} mapMorseBits - Object to map morse marks into its bit representation
 *                                          based on the bit config
 */

/**
 * Given the bit length, returns the config to encode morse code into bits.
 *
 * @param {number} bitLen - Bit Length
 * @return {string} string in morse
 */
function getCfgToEncodeBits(bitLen) {
  const bitOn = '1';
  const bitOff = '0';
  const dit = bitOn.repeat(bitLen);
  const dah = dit.repeat(3);
  const intraSep = bitOff.repeat(bitLen);
  const charSep = intraSep.repeat(2);
  const wordSep = intraSep.repeat(7);

  const mapMorseBits = {
    '': intraSep,
    '.': dit,
    '-': dah,
    ' ': charSep,
    '   ': wordSep,
    remainingPause: bitOff.repeat(bitLen * 7 - 3 * bitLen),
  };

  return {
    charSep,
    intraSep,
    mapMorseBits,
  };
}

/**
 * Given a morse string, convert it into a string of bits.
 * The user can give us the bitLength
 *
 * @param {string} morseStr - Morse code string
 * @param {number} [bitLength = 2] - Bit length for configuration.
 * @return {string} String of bits representating the given morse code and the bit length
 */
function decodeMorse2Bits(morseStr, bitLength = 2) {
  const str = getMessageToProcess(morseStr);
  const { charSep, intraSep, mapMorseBits } = getCfgToEncodeBits(bitLength);

  // str = '.... .-   .... .-'
  const bits = str
    .trim()
    .split('   ') // ['.... .-', '.... .-']
    .map(
      (words) => `${words
        .split(' ') // [ "....", ".-" ] and [ "....", ".-" ]
        .map(
          (morseChar) => `${morseChar
            .split('') // First iteration: [ ".", ".", ".", "." ]
            .map((morseBit) => `${mapMorseBits[morseBit]}${intraSep}`)
            .join('')}${charSep}`,
        )
        .join('')}${mapMorseBits.remainingPause}`,
    )
    .join('');

  return bits;
}

function decodeWithDicothomyTree(node, chars) {
  const cur = chars.shift();

  if (!node[cur]) return node.val || '(?)';

  return decodeWithDicothomyTree(node[cur], chars);
}

function decodeMorse2HumanDichotomy(morseStr) {
  const words = morseStr.split('   ');

  const res = words // ['.... --- .-.. .-', '-- . .-.. ..']
    .flatMap((word) => {
      // word = ['.... --- .-.. .-']
      const decodedWord = word
        .split(' ') // ['....', '---', '.-..', '.-']
        .reduce((acc, cur) => [...acc, decodeWithDicothomyTree(MORSETREE, cur.split(''))], []); // cur = ['....']
      return [decodedWord.join(''), ' '];
    })
    .join('');

  return res;
}

module.exports = {
  cleanPulses,
  checkIfTimingIsPerfect,
  decodeBits2Morse,
  decodeHuman2Morse,
  decodeMorse2Bits,
  translate2Human,
  decodeMorse2HumanDichotomy,
  getAverage,
  getBitsCfg,
  getCfgPerfectTiming,
  getCfgToEncodeBits,
  getElement,
  getMessageToProcess,
  getOccurrenceExtreme,
  getPulsesData,
  partitionPulses,
};
