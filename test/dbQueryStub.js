'use strict';


exports.register = (server, options, next) => {

  const data = require('./data');
  /*
    server method stubs
  */
  server.method('findAndLimitBy', (model, limit, cb) => {

    cb(null, data.slice(0, limit));
  });

  server.method('findByCategory', (model, category, limit, cb) => {

    const result = data.filter((d) =>

      d.category_list.match(new RegExp(category))
    );
    cb(null, result.slice(0, limit));
  });

  server.method('findByName', (model, name, cb) => {

    const result = data.filter((d) => d.name === name);
    cb(null, result[0]);
  });

  server.method('validateUser', (email, cb) => {

    cb(null, { email: 'williemik.wmik@gmail.com' });
  });
  return next();
};

exports.register.attributes = {
  name: 'server-method-stubs',
  version: '0.1.0'
};
