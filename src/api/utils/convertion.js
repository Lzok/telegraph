const {
  DIT,
  DAH,
  INTRASEP,
  CHARSEP,
  WORDSEP,
  MORSE2ALPHA,
  ALPHA2MORSE,
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
function decodeMorse2Human(morse) {
  const h = morse
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

function decodeMorse2Bits(str, bitLength = 2) {
  const bitOn = '1';
  const bitOff = '0';
  const dit = bitOn.repeat(bitLength);
  const dah = dit.repeat(3);
  const intraSep = bitOff.repeat(bitLength);
  const charSep = intraSep.repeat(2);
  const wordSep = intraSep.repeat(7);

  const map = {
    '': intraSep,
    '.': dit,
    '-': dah,
    ' ': charSep,
    '   ': wordSep,
    remainingPause: bitOff.repeat(bitLength * 7 - 3 * bitLength),
  };

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
            .map((morseBit) => `${map[morseBit]}${intraSep}`)
            .join('')}${charSep}`,
        )
        .join('')}${map.remainingPause}`,
    )
    .join('');

  decodeBits2Morse(bits);
  return bits;
}

module.exports = {
  cleanPulses,
  checkIfTimingIsPerfect,
  decodeBits2Morse,
  decodeHuman2Morse,
  decodeMorse2Bits,
  decodeMorse2Human,
  getAverage,
  getBitsCfg,
  getCfgPerfectTiming,
  getElement,
  getOccurrenceExtreme,
  getPulsesData,
  partitionPulses,
};
