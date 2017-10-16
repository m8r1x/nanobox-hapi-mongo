'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const CompaniesSchema = new Schema({
  _id: {
    type: String
  },
  permalink: {
    type: String
  },
  name: {
    type: String
  },
  homepage_url: {
    type: String
  },
  category_list: {
    type: String
  },
  funding_total_usd: {
    type: Number
  },
  status: {
    type: String
  },
  country_code: {
    type: String
  },
  state_code: {
    type: String
  },
  region: {
    type: String
  },
  city: {
    type: String
  },
  funding_rounds: {
    type: Number
  },
  founded_at: {
    type: String
  },
  first_funding_at: {
    type: Date
  },
  last_funding_at: {
    type: Date
  }
}, { collection: 'companies', timestamps: true });

module.exports = Mongoose.model('Companies', CompaniesSchema);
