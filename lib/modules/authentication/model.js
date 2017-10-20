'use strict';

const Mongoose = require('mongoose');
const Bcrypt = require('bcryptjs');

const Schema = Mongoose.Schema;
const SALT_WORK_FACTOR = 10;

const UserAuthModel = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, { collection: 'authentication', timestamps: true });

UserAuthModel.pre('save', function (next) {

  const self = this;

  if (!self.isModified('password')) {
    return next();
  }

  Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {

    if (err) {
      return next(err);
    }
    Bcrypt.hash(self.password, salt, (err, hash) => {

      if (err) {
        return next(err);
      }
      self.password = hash;
      next();
    });
  });
});

UserAuthModel.methods.comparePassword = function (password, cb) {

  Bcrypt.compare(password, this.password, (err, isMatch) => {

    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = Mongoose.model('UserAuth', UserAuthModel);
