const {
  bits2morse,
  morse2human,
  morse2bits,
  human2morse,
} = require('../api/openAPI/convert.swagger');

const swaggerDocument = {
  openapi: '3.0.1',
  info: {
    version: '1.0.0',
    title: 'Morse APIs Document',
    description:
      'API to convert morse to human text | bits to morse | human to morse | morse to bits',
    termsOfService: '',
    contact: {
      name: 'Leandro Echevarria',
      email: 'EchevarriaLeandro@gmail.com',
      url: 'https://github.com/lzok',
    },
    license: {
      name: 'AGPL-3.0',
      url: 'https://www.gnu.org/licenses/agpl-3.0.html',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Local server',
    },
  ],
  tags: [
    {
      name: 'Morse',
    },
  ],
  paths: {
    '/convert/bits/morse': {
      post: bits2morse,
    },
    '/convert/morse/human': {
      post: morse2human,
    },
    '/convert/morse/bits': {
      post: morse2bits,
    },
    '/convert/human/morse': {
      post: human2morse,
    },
  },
};

module.exports = {
  swaggerDocument,
};
