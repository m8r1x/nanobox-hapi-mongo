'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Companies = require('./model');

const error = Joi.object().keys({
  statusCode: Joi.number(),
  error: Joi.string(),
  message: Joi.string()
});

const schema = Joi.object().keys({
  _id: Joi.string(),
  permalink: Joi.string(),
  name: Joi.string(),
  homepage_url: Joi.string(),
  category_list: Joi.string(),
  funding_total_usd: Joi.number(),
  status: Joi.string(),
  country_code: Joi.string().allow(''),
  state_code: Joi.string().allow(''),
  region: Joi.string().allow(''),
  city: Joi.string().allow(''),
  funding_rounds: Joi.number(),
  founded_at: Joi.string().isoDate().allow(''),
  first_funding_at: Joi.date(),
  last_funding_at: Joi.date()/*,
  $__: Joi.object(),
  isNew: Joi.boolean(),
  errors: Joi.object(),
  _doc: Joi.object(),
  $init: Joi.boolean()*/
}).unknown();


exports.register = (server, options, next) => {

  const { baseUrl } = options;

  server.route([
    {
      method: 'GET',
      path: baseUrl,
      config: {
        description: 'companies',
        notes: 'Get a list of companies from the database',
        tags: ['api'],
        validate: {
          query: {
            limit: Joi.number().min(1).max(20).default(5)
          }
        },
        response: {
          status: {
            200: Joi.array().items(schema),
            400: error,
            500: error
          }
        }
      },
      handler: (request, reply) => {

        server.methods.findAndLimitBy(Companies, request.query.limit,
          (err, result) => {

            if (err) {
              return reply(Boom.boomify(err, {
                statusCode: 500,
                message: 'Internal Server Error caused by MongoDB'
              }));
            }
            reply(result);
          }
        );
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
