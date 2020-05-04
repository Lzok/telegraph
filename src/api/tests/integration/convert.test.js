const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;

const SERVER_URL = 'http://localhost:3000';

chai.use(chaiHttp);

describe('Convert API', () => {
  describe('Bits 2 Morse Suite', () => {
    it('Should return the convertion ok for a imperfect timed string', (done) => {
      const body = {
        text:
          '000000001101101100111000001111110001111110011111100000001110111111110111011100000001100011111100000',
      };
      const morseOk = '.... --- .-.. .-';

      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/bits/morse')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(200);
          expect(res.body).to.have.property('text', morseOk);
          done();
        });
    });

    it('Should return the convertion ok for a perfect timed string', (done) => {
      const body = {
        text:
          '11001100110011000000110000001111110011001111110011111100000000000000111111001100111111001111110000001111110011111100111111000000110011001111110000000',
      };
      const morseOk = '.... . -.--   -.-- --- ..-';

      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/bits/morse')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(200);
          expect(res.body).to.have.property('text', morseOk);
          done();
        });
    });

    it('Should return bad request if the bits do not contain any pulse', (done) => {
      const body = { text: '000000000000000000000000000000000' };
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/bits/morse')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if an empty body is sent', (done) => {
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/bits/morse')
        .send({})
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if other than 0s and 1s are sent in the body', (done) => {
      const body = { text: '000011011A0111000' };
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/bits/morse')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if other key than "text" is sent in the body', (done) => {
      const body = { text: '0000110110111000', other: 'key' };
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/bits/morse')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });
  });

  describe('Morse 2 Human Suite', () => {
    it('Should return the correct translation with a multi word sentence', (done) => {
      const body = { text: '- .... .   .--- --- -.- . .-.' };

      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/human')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(200);
          expect(res.body).to.have.property('text', 'THE JOKER');
          done();
        });
    });

    it('Should return bad request if an empty body is sent', (done) => {
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/human')
        .send({})
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if other than dots, dashes or spaces are sent in the body', (done) => {
      const body = { text: '..- q ..-' };
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/human')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if other key than "text" is sent in the body', (done) => {
      const body = { text: '.... .. -', other: 'key' };
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/human')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });
  });

  describe('Morse 2 Bits Suite', () => {
    const body = { text: '.... --- .-.. .- -- . .-.. ..' };

    it('Should return the bits with the default bitLength which is 2', (done) => {
      const bitsOk = '1100110011001100000011111100111111001111110000001100111111001100110000001100111111000000111111001111110000001100000011001111110011001100000011001100000000000000';
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/bits')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(200);
          expect(res.body).to.have.property('text', bitsOk);
          done();
        });
    });

    it('Should return the bits using the bitLength passed by queryparams', (done) => {
      const bitsOk = '111000111000111000111000000000111111111000111111111000111111111000000000111000111111111000111000111000000000111000111111111000000000111111111000111111111000000000111000000000111000111111111000111000111000000000111000111000000000000000000000';
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/bits')
        .query({ bitLength: 3 })
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(200);
          expect(res.body).to.have.property('text', bitsOk);
          done();
        });
    });

    it('Should return bad request if the query string parameter is less than 1', (done) => {
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/bits')
        .query({ bitLength: 0 })
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if the query string parameter is not a number', (done) => {
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/bits')
        .query({ bitLength: 'i am a string' })
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if there are many query string parameters that are not allowed', (done) => {
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/bits')
        .query({ bitLength: 1, another: 'param' })
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if an empty body is sent', (done) => {
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/bits')
        .send({})
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if other than dots, dashes or spaces are sent in the body', (done) => {
      const bodyb = { text: '..- q ..-' };
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/bits')
        .send(bodyb)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if other key than "text" is sent in the body', (done) => {
      const bodyb = { text: '.... .. -', other: 'key' };
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/morse/bits')
        .send(bodyb)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });
  });

  describe('Human 2 Morse Suite', () => {
    it('Should return the correct morse translation', (done) => {
      const body = { text: 'wolf god' };
      const morse = '.-- --- .-.. ..-.   --. --- -..';

      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/human/morse')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(200);
          expect(res.body).to.have.property('text', morse);
          done();
        });
    });

    it('Should return bad request if an empty body is sent', (done) => {
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/human/morse')
        .send({})
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if other alpha numeric characters are sent in the body', (done) => {
      const body = { text: 'something@happened' };
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/human/morse')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });

    it('Should return bad request if other key than "text" is sent in the body', (done) => {
      const body = { text: 'valid string here', other: 'key' };
      chai
        .request(SERVER_URL)
        .post('/api/v1/convert/human/morse')
        .send(body)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.be.eq(400);
          done();
        });
    });
  });
});
