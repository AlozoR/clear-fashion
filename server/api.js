const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const db = require('./db');
const { calculateLimitAndOffset, paginate } = require('paginate-info');

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
  const currentPage = request.query.page ? parseInt(request.query.page) : 1;
  const pageLimit = request.query.size ? parseInt(request.query.size) : 12;
  let mongoQuery = {};
  if (request.query.brand) {
    mongoQuery.brand = request.query.brand;
  }
  if (request.query.price) {
    mongoQuery.price = { $lt: parseInt(request.query.price) };
  }
  const sort = {price: 1, _id: 1};
  const result = {};
  const mongoResult = await db.findAndSort(mongoQuery, sort);
  const { limit, offset } = calculateLimitAndOffset(currentPage, pageLimit);
  const rows = mongoResult.slice(offset, offset + limit);
  result.success = true;
  result.data = {
    result: rows,
    meta: paginate(currentPage, mongoResult.length, rows, pageLimit)
  };
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
