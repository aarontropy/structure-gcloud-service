process.env.NODE_ENV = process.env.NODE_ENV || 'development';
require('dotenv').config({path: __dirname + '/.env'});
// console.log(process.env);
require('./build/server');
