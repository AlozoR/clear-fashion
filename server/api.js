const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const db = require('./db');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/products/search', async (request, response) => {
  const limit = request.query.limit ? parseInt(request.query.limit) : 12;
  let mongoQuery = {};
  if (request.query.brand) {
    mongoQuery.brand = request.query.brand;
  }
  if (request.query.price) {
    mongoQuery.price = { $lt: parseInt(request.query.price) };
  }
  const sort = {price: 1};
  const result = {limit: limit};
  const mongoResult = await db.findSortAndLimit(mongoQuery, sort, limit);
  result.total = mongoResult.length;
  result.results = mongoResult;
  response.send(result);
});

app.get('/products/:id', async (request, response) => {
  const mongoQuery = {_id: request.params.id};
  console.log(mongoQuery);
  const mongoResult = await db.find(mongoQuery);
  response.send(mongoResult);
});

app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);
