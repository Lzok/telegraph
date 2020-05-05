const DIT = '.';
const DAH = '-';
const INTRASEP = '';
const CHARSEP = ' ';
const WORDSEP = '   ';
const FULLSTOP = '.-.-.-';

const MORSE2ALPHA = {
  '.-': 'A',
  '-...': 'B',
  '-.-.': 'C',
  '-..': 'D',
  '.': 'E',
  '..-.': 'F',
  '--.': 'G',
  '....': 'H',
  '..': 'I',
  '.---': 'J',
  '-.-': 'K',
  '.-..': 'L',
  '--': 'M',
  '-.': 'N',
  '---': 'O',
  '.--.': 'P',
  '--.-': 'Q',
  '.-.': 'R',
  '...': 'S',
  '-': 'T',
  '..-': 'U',
  '...-': 'V',
  '.--': 'W',
  '-..-': 'X',
  '-.--': 'Y',
  '--..': 'Z',
  '-----': '0',
  '.----': '1',
  '..---': '2',
  '...--': '3',
  '....-': '4',
  '.....': '5',
  '-....': '6',
  '--...': '7',
  '---..': '8',
  '----.': '9',
  '.-.-.-': '.',
  ' ': ' ',
};

const ALPHA2MORSE = Object.fromEntries(Object.keys(MORSE2ALPHA).map((k) => [MORSE2ALPHA[k], k]));

module.exports = {
  DIT,
  DAH,
  INTRASEP,
  CHARSEP,
  WORDSEP,
  FULLSTOP,
  ALPHA2MORSE,
  MORSE2ALPHA,
};
