// Tree based on https://en.wikipedia.org/wiki/Morse_code#/media/File:Morse_code_tree3.svg
const TREE = {
  '.': {
    val: 'E',
    '.': {
      val: 'I',
      '.': {
        val: 'S',
        '.': {
          val: 'H',
          '.': {
            val: '5',
          },
          '-': {
            val: '4',
          },
        },
        '-': {
          val: 'V',
          '.': {
            val: 'Ś',
          },
          '-': {
            val: '3',
          },
        },
      },
      '-': {
        val: 'U',
        '.': {
          val: 'F',
          '.': {
            val: 'É',
          },
        },
        _: {
          val: 'Ü',
          '.': {
            val: 'DD', // I don't know which character is the original here.
            '.': {
              val: '?',
            },
            '-': {
              val: '_',
            },
          },
          '-': {
            val: '2',
          },
        },
      },
    },
    '-': {
      val: 'A',
      '.': {
        val: 'R',
        '.': {
          val: 'L',
          '-': {
            val: 'È',
            '.': {
              val: '"',
            },
          },
        },
        '-': {
          val: 'Ä',
          '.': {
            val: '+',
            '-': {
              val: '.',
            },
          },
        },
      },
      '-': {
        val: 'W',
        '.': {
          val: 'P',
          '.': {
            val: '(?)', // Another weird character
          },
          '-': {
            val: 'À',
            '.': {
              val: '@',
            },
          },
        },
        '-': {
          val: 'J',
          '.': {
            val: 'Ĵ',
          },
          '-': {
            val: '1',
            '.': {
              val: "'",
            },
          },
        },
      },
    },
  },
  '-': {
    val: 'T',
    '.': {
      val: 'N',
      '.': {
        val: 'D',
        '.': {
          val: 'B',
          '.': {
            val: '6',
            '-': {
              val: '-',
            },
          },
          '-': {
            val: '=',
          },
        },
        '-': {
          val: 'X',
          '.': {
            val: '/',
          },
        },
      },
      '-': {
        val: 'K',
        '.': {
          val: 'C',
          '.': {
            val: 'Ç',
          },
          '-': {
            '.': {
              val: ';',
            },
            '-': {
              val: '!',
            },
          },
        },
        '-': {
          val: 'Y',
          '.': {
            val: '(?)', // Weird character
            '-': {
              val: '()',
            },
          },
        },
      },
    },
    '-': {
      val: 'M',
      '.': {
        val: 'G',
        '.': {
          val: 'Z',
          '.': {
            val: '7',
          },
          '-': {
            '-': {
              val: ',',
            },
          },
        },
        '-': {
          val: 'Q',
          '.': {
            val: '(?)', // Weird character
          },
          '-': {
            val: 'Ñ',
          },
        },
      },
      '-': {
        val: 'O',
        '.': {
          val: 'Ö',
          '.': {
            val: '8',
            '.': {
              val: ':',
            },
          },
        },
        '-': {
          val: 'CH', // Weird to me that CH appears as a value in the tree.
          '.': {
            val: '9',
          },
          '-': {
            val: '0',
          },
        },
      },
    },
  },
};

module.exports = {
  TREE,
};
