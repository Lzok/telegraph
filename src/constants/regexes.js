module.exports = {
  BITSTRING: /^[0-1]*$/m, // Just a string made by 0s and 1s
  MORSESTRING: /^[\\.\- ]*$/, // Just a string made by morse characters (including space)
  SEPARATEPULSES: /(0+|1+)/g,
  ALPHANUM_SPACE_PERIOD: /^[a-zA-Z0-9 .]*$/,
};
