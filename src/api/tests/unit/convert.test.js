const { expect } = require('chai');
const {
  DIT, DAH, INTRASEP, CHARSEP, WORDSEP,
} = require('../../../constants/morse');
const morseScripts = require('../../utils/convertion');

const {
  cleanPulses,
  checkIfTimingIsPerfect,
  decodeBits2Morse,
  decodeHuman2Morse,
  decodeMorse2Bits,
  translate2Human,
  getAverage,
  getBitsCfg,
  getCfgPerfectTiming,
  getCfgToEncodeBits,
  getElement,
  getMessageToProcess,
  getOccurrenceExtreme,
  getPulsesData,
  partitionPulses,
} = morseScripts;

describe('Scripts', () => {
  it('should return the average of the array items length', (done) => {
    const arr = ['00', '111', '0000', '110'];
    const result = getAverage(arr);
    expect(result).to.be.eq(3);
    done();
  });

  it('should return the min and max of the array items length', (done) => {
    const arr = ['00', '111', '0000', '110'];
    const [min, max] = getOccurrenceExtreme(arr);
    expect(min).to.be.eq(2);
    expect(max).to.be.eq(4);
    done();
  });

  it('should remove the initial al final zeros from the pulses', (done) => {
    const pulseA = ['000000', '110', '001111110', '0000', '1111110', '01111110', '000000'];
    const pulseB = ['000000', '110', '001111110', '0000', '1111110', '01111110'];
    const pulseC = ['110', '001111110', '0000', '1111110', '01111110', '000000'];

    const cleaned = ['110', '001111110', '0000', '1111110', '01111110'].join('');

    const resultA = cleanPulses(pulseA);
    const resultB = cleanPulses(pulseB);
    const resultC = cleanPulses(pulseC);

    expect(resultA.join('')).to.be.eq(cleaned);
    expect(resultB.join('')).to.be.eq(cleaned);
    expect(resultC.join('')).to.be.eq(cleaned);

    done();
  });

  it('Should decode a morse string into human readable translation', (done) => {
    const morse = '... -.-. .... .. ... --   -... -.--   - --- --- .-..';
    const human = 'SCHISM BY TOOL';

    const decoded = translate2Human(morse);
    expect(decoded).to.be.equal(human);

    done();
  });

  it('Should checkIfTimingIsPerfect function return true with perfect pulses', (done) => {
    // zeros and ones for a perfect pulse
    const zeros = ['00', '00', '000000', '000000', '00', '00000000000000', '00', '000000'];
    const ones = ['11', '11', '111111', '111111', '11', '111111', '11', '11', '111111', '11'];

    const isPerfect = checkIfTimingIsPerfect(zeros, ones);

    expect(isPerfect).to.be.eq(true);
    done();
  });

  it('Should checkIfTimingIsPerfect function return false with imperfect pulses', (done) => {
    // zeros and ones for a perfect pulse
    const zeros = ['00', '00', '00000', '000000', '000', '00000000000000', '00', '000000'];
    const ones = ['111', '111111', '1111111', '111111', '111', '1111'];

    const isImperfect = checkIfTimingIsPerfect(zeros, ones);

    expect(isImperfect).to.be.eq(false);
    done();
  });

  it('Should getPulsesData function returns the values ok', (done) => {
    const pulses = ['110', '001111110', '0000', '1111110', '01111110'];

    const resultOk = {
      avgzero: 7,
      avgone: 5,
      isTimingPerfect: false,
      peaks: {
        minzeroLen: 4,
        maxzeroLen: 9,
        minoneLen: 3,
        maxoneLen: 7,
      },
    };
    const result = getPulsesData(pulses);

    expect(result).to.be.deep.eq(resultOk);
    done();
  });

  it('Should getCfgPerfectTiming function return the correct data', (done) => {
    const data = {
      bitLen: 3,
      limitDot: 9,
      charsepLen: 9,
      wordSepLen: 21,
    };

    const result = getCfgPerfectTiming(3);
    expect(result).to.be.deep.eq(data);
    done();
  });

  it('Should getCfgToEncodeBits function return the correct data', (done) => {
    const data = {
      charSep: '0000',
      intraSep: '00',
      mapMorseBits: {
        '': '00',
        '.': '11',
        '-': '111111',
        ' ': '0000',
        '   ': '00000000000000',
        remainingPause: '00000000',
      },
    };

    const result = getCfgToEncodeBits(2);
    expect(result).to.be.deep.eq(data);
    done();
  });

  it('Should getBitsCfg function returns the expected values when the timing is perfect', (done) => {
    const payload = {
      isTimingPerfect: true,
      peaks: {
        minoneLen: 2,
        minzeroLen: 3,
        maxzeroLen: 11,
      },
    };

    const responseOk = {
      bitLen: 2,
      limitDot: 6,
      charsepLen: 6,
      wordSepLen: 14,
    };

    const result = getBitsCfg(payload);

    expect(result).to.be.deep.eq(responseOk);
    done();
  });

  it('Should getBitsCfg function returns the expected values when the timing is not perfect', (done) => {
    const payload = {
      isTimingPerfect: false,
      peaks: {
        minoneLen: 2,
        maxoneLen: 3,
        minzeroLen: 3,
        maxzeroLen: 11,
      },
    };

    const responseOk = {
      bitLen: 2,
      limitDot: 3,
      charsepLen: 7,
      wordSepLen: 12,
    };

    const result = getBitsCfg(payload);

    expect(result).to.be.deep.eq(responseOk);
    done();
  });

  it('Should partitionPulses function return the correct partitioned arrays', (done) => {
    const pulses = ['11', '00', '00000', '111111', '000', '111111', '0000000', '11', '0', '111'];
    const zerosOk = ['00', '00000', '000', '0000000', '0'];
    const onesOk = ['11', '111111', '111111', '11', '111'];

    const [zeros, ones] = partitionPulses(pulses);

    expect(zeros).to.be.deep.eq(zerosOk);
    expect(ones).to.be.deep.eq(onesOk);
    done();
  });

  describe('Suite for getElement function', () => {
    const pulseDot = '11';
    const pulseDash = '111111';
    const pulseIntra = '00';
    const pulseCharSep = '000000';
    const pulseWordSep = '00000000000000';
    const cfg = {
      limitDot: 3,
      charsepLen: 3,
      wordSepLen: 14,
    };

    it('Should return a dot -DIT- (.)', (done) => {
      const result = getElement(pulseDot, cfg);

      expect(result).to.be.eq(DIT);
      done();
    });

    it('Should return a dash -DAH- (-)', (done) => {
      const result = getElement(pulseDash, cfg);

      expect(result).to.be.eq(DAH);
      done();
    });

    it('Should return an empty string -INTRA SEPARATOR- (""))', (done) => {
      const result = getElement(pulseIntra, cfg);

      expect(result).to.be.eq(INTRASEP);
      done();
    });

    it('Should return a single space -CHAR SEPARATOR- (" ")', (done) => {
      const result = getElement(pulseCharSep, cfg);

      expect(result).to.be.eq(CHARSEP);
      done();
    });

    it('Should return a long space made by three spaces -WORD SEPARATOR- ("   ")', (done) => {
      const result = getElement(pulseWordSep, cfg);

      expect(result).to.be.eq(WORDSEP);
      done();
    });
  });

  describe('Suite for decodeBits2Morse function', () => {
    // Hint: A Pink Floyd song ;)
    const withPerfectTiming = '11001100110011000000110000001111110011001111110011111100000000000000111111001100111111001111110000001111110011111100111111000000110011001111110000000';
    const imperfectTiming = '000000001101101100111000001111110001111110011111100000001110111111110111011100000001100011111100000111111001111110000000110000110111111110111011100000011011100000000000';
    const withNoDashesAndPerfectTiming = '00000000011001100110011000000110011000000000000';

    it('Should return the correct morse string for a string of bits with perfect timing', (done) => {
      const morseOk = '.... . -.--   -.-- --- ..-';

      const result = decodeBits2Morse(withPerfectTiming);
      expect(result).to.be.eq(morseOk);
      done();
    });

    it('Should return the correct morse string for a string of bits with imperfect timing', (done) => {
      const morseOk = '.... --- .-.. .- -- . .-.. ..';

      const result = decodeBits2Morse(imperfectTiming);
      expect(result).to.be.eq(morseOk);
      done();
    });

    it('Should return the correct morse string for a string of bits with NO dashes and perfect timing', (done) => {
      const morseOk = '.... ..';

      const result = decodeBits2Morse(withNoDashesAndPerfectTiming);
      expect(result).to.be.eq(morseOk);
      done();
    });
  });

  describe('Suite for decodeHuman2Morse function', () => {
    it('Should return the morse string for the "human" input', (done) => {
      const humanStr = 'up against the void';
      const morseOk = '..- .--.   .- --. .- .. -. ... -   - .... .   ...- --- .. -..';

      const result = decodeHuman2Morse(humanStr);

      expect(result).to.be.eq(morseOk);
      done();
    });
  });

  describe('Suite for getMessageToProcess function', () => {
    it('Should return the morse string without modifications because it has not a full stop (.-.-.-)', (done) => {
      const morse = '..- .--.   .- --. .- .. -. ... -   - .... .   ...- --- .. -..';

      const result = getMessageToProcess(morse);

      expect(result).to.be.eq(morse);
      done();
    });

    it('Should return the morse string before the full stop (.-.-.-) including it.', (done) => {
      const morse = '..- .--.   .- --. .- .. -. ... -   .-.-.- - .... .   ...- --- .. -..';
      const morseOk = '..- .--.   .- --. .- .. -. ... -   .-.-.-';

      const result = getMessageToProcess(morse);

      expect(result).to.be.eq(morseOk);
      done();
    });
  });

  describe('Suite for decodeMorse2Bits function', () => {
    const morse = '... . -.--';
    const morseNoDashes = '.... ..'; // Hi

    it('Should convert the morse string to bits using the default bitLen value = 2', (done) => {
      const bitsOk = '1100110011000000110000001111110011001111110011111100000000000000';
      const r = decodeMorse2Bits(morse);

      expect(r).to.be.eq(bitsOk);
      done();
    });

    it('Should convert the morse string to bits using the given bitLen value', (done) => {
      const bitsOk = '111000111000111000000000111000000000111111111000111000111111111000111111111000000000000000000000';
      const r = decodeMorse2Bits(morse, 3);

      expect(r).to.be.eq(bitsOk);
      done();
    });

    it('Should convert the morse string without dashes to bits using the default bitLen value', (done) => {
      const bitsOk = '1100110011001100000011001100000000000000';
      const r = decodeMorse2Bits(morseNoDashes);

      expect(r).to.be.eq(bitsOk);
      done();
    });
  });
});
