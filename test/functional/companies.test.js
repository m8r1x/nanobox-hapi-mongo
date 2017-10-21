'use strict';

const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');

const lab = exports.lab = Lab.script();
const { describe, it, before } = lab;
const expect = Code.expect;

describe('Companies module test suite', () => {

  const baseUrl = '/v1/companies';
  const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjU5ZTljZmU4OTE0NGRiMzNlODg2NmM3YSIsImVtYWlsIjoid2lsbGllbWlrLndtaWtAZ21haWwuY29tIn0sImlhdCI6MTUwODUxMTM3MiwiZXhwIjoxNTQwMDY4OTcyfQ.hdmyRztVt3Oh0SamEExv8WhUkxUmWc7aqrff3GNAdnw';

  before((done) => {

    const data = require('../data');
    const Server = this.Server = new Hapi.Server();
    Server.connection();

    /*
      Server method stubs
    */
    Server.method('findAndLimitBy', (model, limit, next) => {

      next(null, data.slice(0, limit));
    });

    Server.method('findByName', (model, name, next) => {

      const result = data.filter((d) => d.name === name);
      next(null, result[0]);
    });

    Server.method('validateUser', (email, cb) => {

      cb(null, { email: 'williemik.wmik@gmail.com' });
    });

    Server.register([
      require('hapi-auth-jwt'),
      {
        register: require('../../lib/modules/companies'),
        options: {
          baseUrl: '/v1/companies'
        }
      }], (err) => {

      expect(err).to.not.exist();
      done();
    });
  });

  it('should return array of 5 records by default', (done) => {

    this.Server.inject({
      method: 'GET',
      url: baseUrl,
      headers: {
        authorization: token
      }
    }, (response) => {

      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.an.array().and.have.length(5);
      done();
    });
  });

  it('should return array of 3 records when limit=3',
    (done) => {

      this.Server.inject({
        method: 'GET',
        url: baseUrl + '?limit=3',
        headers: {
          authorization: token
        }
      }, (response) => {

        expect(response.statusCode).to.equal(200);
        expect(response.result).to.be.an.array().and.have.length(3);
        done();
      });
    });

  it('should return one record specified by name',
    (done) => {

      this.Server.inject({
        method: 'GET',
        url: baseUrl + '/0-6.com',
        headers: {
          authorization: token
        }
      }, (response) => {

        expect(response.statusCode).to.equal(200);
        expect(response.result).to.be.an.object();
        done();
      });
    });

  it('should respond 400 when limit is NaN',
    (done) => {

      this.Server.inject({
        method: 'GET',
        url: baseUrl + '?limit=me',
        headers: {
          authorization: token
        }
      }, (response) => {

        expect(response.statusCode).to.equal(400);
        expect(response.result.error).to.equal('Bad Request');
        done();
      });
    });

  it('should respond 500 when the database throws an error',
    (done) => {

      const stub = Sinon.stub(this.Server.methods, 'findAndLimitBy');
      stub.callsFake((model, limit, next) => {

        next(new Error());
      });

      this.Server.inject({
        method: 'GET',
        url: baseUrl,
        headers: {
          authorization: token
        }
      }, (response) => {

        expect(response.statusCode).to.equal(500);
        expect(response.result.error).to.equal('Internal Server Error');
        done();
      });
    });

  it('should respond 404 when name is not found',
    (done) => {

      this.Server.inject({
        method: 'GET',
        url: baseUrl + '/fcebok',
        headers: {
          authorization: token
        }
      }, (response) => {

        expect(response.statusCode).to.equal(404);
        expect(response.result.error).to.equal('Not Found');
        done();
      });
    });

  it('should respond 500 when database throws an error',
    (done) => {

      const stub = Sinon.stub(this.Server.methods, 'findByName');
      stub.callsFake((model, limit, next) => {

        next(new Error());
      });

      this.Server.inject({
        method: 'GET',
        url: baseUrl + '/facebook',
        headers: {
          authorization: token
        }
      }, (response) => {

        expect(response.statusCode).to.equal(500);
        expect(response.result.error).to.equal('Internal Server Error');
        done();
      });
    });

  it('should respond 500 when authentication fails with error',
    (done) => {

      const validateUserStub = this.validateUserStub =
       Sinon.stub(this.Server.methods, 'validateUser');

      validateUserStub.callsFake((email, cb) => {

        cb(new Error());
      });

      this.Server.inject({
        method: 'GET',
        url: baseUrl,
        headers: {
          authorization: token
        }
      }, (response) => {

        expect(response.statusCode).to.equal(500);
        done();
      });
    });

  it('should respond 401 when user is not found', (done) => {

    this.validateUserStub.onSecondCall().callsFake((email, cb) => {

      cb(null, null);
    });

    this.Server.inject({
      method: 'GET',
      url: baseUrl,
      headers: {
        authorization: token
      }
    }, (response) => {

      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should respond 401 when invalid authentication token',
    (done) => {

      this.validateUserStub.onThirdCall().callsFake((email, cb) => {

        cb(null, { email: 'email@domain.com' });
      });

      this.Server.inject({
        method: 'GET',
        url: baseUrl,
        headers: {
          authorization: token
        }
      }, (response) => {

        expect(response.statusCode).to.equal(401);
        done();
      });
    });
});
