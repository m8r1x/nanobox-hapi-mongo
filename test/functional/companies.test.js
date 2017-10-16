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

  before((done) => {

    const Server = this.Server = new Hapi.Server();
    Server.connection();
    Server.method('findAndLimitBy', (model, limit, next) => {

      next(null, require('../data').slice(0, limit));
    });
    Server.register({
      register: require('../../lib/modules/companies'),
      options: {
        baseUrl: '/v1/companies'
      }
    }, (err) => {

      expect(err).to.not.exist();
      done();
    });
  });

  it('should return array of 5 companies by default', (done) => {

    this.Server.inject({
      method: 'GET',
      url: baseUrl
    }, (response) => {

      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.an.array().and.have.length(5);
      done();
    });
  });

  it('should return array of 3 companies', (done) => {

    this.Server.inject({
      method: 'GET',
      url: baseUrl + '?limit=3'
    }, (response) => {

      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.an.array().and.have.length(3);
      done();
    });
  });

  it('should respond with a 400 error', (done) => {

    this.Server.inject({
      method: 'GET',
      url: baseUrl + '?limit=me'
    }, (response) => {

      expect(response.statusCode).to.equal(400);
      expect(response.result.error).to.equal('Bad Request');
      done();
    });
  });

  it('should respond with a 500 error', (done) => {

    const stub = Sinon.stub(this.Server.methods, 'findAndLimitBy');
    stub.callsFake((model, limit, next) => {

      next(new Error());
    });
    this.Server.inject({
      method: 'GET',
      url: baseUrl
    }, (response) => {

      expect(response.statusCode).to.equal(500);
      expect(response.result.error).to.equal('Internal Server Error');
      done();
    });
  });
});
