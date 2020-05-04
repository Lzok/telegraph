const badRequest = {
  400: {
    description: 'Bad request due to malformed payload.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error description.',
            },
          },
        },
      },
    },
  },
};

const bits2morse = {
  tags: ['Bits2Morse'],
  description: 'Converts a given string of bits into a morse string.',
  operationId: 'bits2morse',
  requestBody: {
    description: 'String of bits to convert to morse.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'String of bits be converted into morse.',
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Morse string.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Morse string made by the given bits.',
              },
            },
          },
        },
      },
    },
    ...badRequest,
  },
};

const morse2human = {
  tags: ['Morse2Human'],
  description: 'Converts a given string of morse code into a human readable string.',
  operationId: 'morse2human',
  requestBody: {
    description: 'String of morse code to convert into a human readable string.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'String of morse code to be converted into human readable string.',
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Human readable string returned.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Human readable string made by the given morse code.',
              },
            },
          },
        },
      },
    },
    ...badRequest,
  },
};

const morse2bits = {
  tags: ['Morse2Bits'],
  description: 'Converts a given string of morse code into a bits string.',
  operationId: 'morse2bits',
  parameters: [
    {
      in: 'query',
      name: 'bitLength',
      description: 'Bit length to configure the convertion. Minimum value = 1',
      schema: {
        type: 'integer',
      },
      required: false,
    },
  ],
  requestBody: {
    description: 'String of morse code to convert into a bits string.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'String of morse code to be converted into bits string.',
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Bits string returned.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Bits string made by the given morse code.',
              },
            },
          },
        },
      },
    },
    ...badRequest,
  },
};

const human2morse = {
  tags: ['Human2Morse'],
  description: 'Converts a given human readable string into a morse code one.',
  operationId: 'human2morse',
  requestBody: {
    description: 'Human readable string to be converted into a morse code one.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Human readable string to be converted into a morse code one.',
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Morse string.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Morse string made by the given human readable string.',
              },
            },
          },
        },
      },
    },
    ...badRequest,
  },
};

module.exports = {
  bits2morse,
  morse2human,
  human2morse,
  morse2bits,
};
