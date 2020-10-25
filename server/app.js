const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const bluebird = require('bluebird');
const { graphqlHTTP } = require('express-graphql');
require('dotenv').config();


/* CONNECT TO THE DATABASE */
mongoose.connect(process.env.MONGO_URL, { promiseLibrary: bluebird, useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>  console.log('Successfully connected to database...'))
  .catch((err) => console.error(err));


/* INITIALIZE THE EXPRESS SERVER */
const app = express();
app.get('env');
app.set('view engine', 'ejs');
if (process.env.NODE_ENV === 'development')
    app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/graphql', cors(), graphqlHTTP({
    schema: schema,
    rootValue: global,
    graphiql: process.env.NODE_ENV === 'development'
}));


/* SET ROUTES HERE */



app.listen(process.env.PORT, () => `Server started on port ${process.env.PORT}...`);