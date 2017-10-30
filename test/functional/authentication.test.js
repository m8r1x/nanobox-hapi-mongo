'use strict';

const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');

const lab = exports.lab = Lab.script();
const { describe, it, before } = lab;
const expect = Code.expect;

describe('Authentication module test suite', () => {

  const baseUrl = '/v1/user';

  before((done) => {

    const Server = this.Server = new Hapi.Server();
    Server.connection();

    Server.method('registerUser', (model, payload, next) => {

      next(null, { message: 'Registration successful' });
    });
    Server.method('fetchToken', (model, payload, next) => {

      next(null, { token: 'jwtoken' });
    });

    Server.register({
      register: require('../../lib/modules/authentication'),
      options: {
        baseUrl
      }
    }, (err) => {

      expect(err).to.not.exist();
      done();
    });
  });

  it('should successfully register a new user',
    (done) => {

      this.Server.inject({
        method: 'POST',
        url: baseUrl + '/register',
        payload: {
          email: 'email@domain.com',
          password: 'thispass'
        }
      }, (response) => {

        expect(response.statusCode).to.equal(200);
        expect(response.result.message).to.equal('Registration successful');
        done();
      });
    });

  it('should return a token on successful login', (done) => {

    this.Server.inject({
      method: 'POST',
      url: baseUrl + '/login',
      payload: {
        email: 'email@domain.com',
        password: 'thispass'
      }
    }, (response) => {

      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.an.object();
      done();
    });
  });

  it('should respond 400 when email already exists',
    (done) => {

      const registerUserStub = this.registerUserStub =
      Sinon.stub(this.Server.methods, 'registerUser');

      registerUserStub.callsFake((model, payload, cb) => {

        cb(null, { message: 'email exists.' });
      });

      this.Server.inject({
        method: 'POST',
        url: baseUrl + '/register',
        payload: {
          email: 'email@domain.com',
          password: 'thispass'
        }
      }, (response) => {

        expect(response.statusCode).to.equal(400);
        expect(response.result.error).to.equal('Bad Request');
        done();
      });
    });

  it('should respond 500 for `/user/register` when database throws an error',
    (done) => {

      this.registerUserStub.onSecondCall().callsFake(
        (model, payload, cb) => {

          cb(new Error());
        });

      this.Server.inject({
        method: 'POST',
        url: baseUrl + '/register',
        payload: {
          email: 'email@domain.com',
          password: 'thispass'
        }
      }, (response) => {

        expect(response.statusCode).to.equal(500);
        expect(response.result.error).to.equal('Internal Server Error');
        done();
      });
    });


  it('should respond 400 when user login is not found',
    (done) => {

      const fetchTokenStub = this.fetchTokenStub =
      Sinon.stub(this.Server.methods, 'fetchToken');

      fetchTokenStub.callsFake((model, payload, cb) => {

        cb(null, { message: 'Not found' });
      });

      this.Server.inject({
        method: 'POST',
        url: baseUrl + '/login',
        payload: {
          email: 'email@domain.com',
          password: 'thispass'
        }
      }, (response) => {

        expect(response.statusCode).to.equal(404);
        expect(response.result.error).to.equal('Not Found');
        done();
      });
    });

  it('should respond 401 when user is unauthorized',
    (done) => {

      this.fetchTokenStub.onSecondCall().callsFake(
        (model, payload, cb) => {

          cb(null, { message: 'Unauthorized' });
        });

      this.Server.inject({
        method: 'POST',
        url: baseUrl + '/login',
        payload: {
          email: 'email@domain.com',
          password: 'thispass'
        }
      }, (response) => {

        expect(response.statusCode).to.equal(401);
        expect(response.result.error).to.equal('Unauthorized');
        done();
      });
    });

  it('should respond 500 for `/user/login` when database throws an error',
    (done) => {

      this.fetchTokenStub.onThirdCall().callsFake(
        (model, payload, cb) => {

          cb(new Error());
        });

      this.Server.inject({
        method: 'POST',
        url: baseUrl + '/login',
        payload: {
          email: 'email@domain.com',
          password: 'thispass'
        }
      }, (response) => {

        expect(response.statusCode).to.equal(500);
        expect(response.result.error).to.equal('Internal Server Error');
        done();
      });
    });
});
