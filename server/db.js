const {MongoClient} = require('mongodb');
const fs = require('fs');

// const MONGODB_URI = 'mongodb+srv://user:fKet5ujmRMisY6Ch@clear-fashion-cluster.xriol.mongodb.net?retryWrites=true&writeConcern=majority';
const MONGODB_URI = 'mongodb+srv://alozor:ocrmBRSaJQlfGtxL@clear-fashion-cluster.xriol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashion';

let client = null;
let db = null;

const init = async () => {
  if (db) {
    return db;
  }
  client = await MongoClient.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
  db = client.db(MONGODB_DB_NAME);
  return db;
};

const insertProducts = async () => {
  db = await init();
  const data = fs.readFileSync('products.json');
  const products = JSON.parse(data);

  const collection = db.collection('products');
  const result = collection.insertMany(products);
};

const findBrand = async brand => {
  db = await init();
  const collection = db.collection('products');
  const products = await collection.find({brand: brand}).toArray();

  console.log(products);
};

const findPrice = async price => {
  db = await init();
  const collection = db.collection('products');
  const products = await collection.find({price: {$lt: price}}).toArray();

  console.log(products);
};

const findSorted = async () => {
  db = await init();
  const collection = db.collection('products');
  const products = await collection.find().sort({'price': 1}).toArray();

  console.log(products);
};


// insertProducts().then(() => {
//   console.log('Insertion complete!');
// });
// findBrand('ADRESSE Paris');
// findPrice(50);
findSorted();
