require('dotenv').config();
const {MongoClient} = require('mongodb');
const fs = require('fs');

const MONGODB_DB_NAME = 'clearfashion';
const MONGODB_COLLECTION = 'products';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alozor:ocrmBRSaJQlfGtxL@clear-fashion-cluster.xriol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

let client = null;
let database = null;

/**
 * Get db connection
 */
const getDB = module.exports.getDB = async () => {
  try {
    if (database) {
      console.log('💽  Already Connected');
      return database;
    }

    client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true, useUnifiedTopology: true});
    database = client.db(MONGODB_DB_NAME);

    console.log('💽  Connected');

    return database;
  } catch (error) {
    console.error('🚨 MongoClient.connect...', error);
    return null;
  }
};

/**
 * Insert list of products
 * @param  {Array}  products
 * @return {Object}
 */
module.exports.insert = async products => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    // More details
    // https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/#insert-several-document-specifying-an-id-field
    const result = await collection.insertMany(products, {'ordered': false});

    return result;
  } catch (error) {
    console.error('🚨 collection.insertMany...', error);
    fs.writeFileSync('products.json', JSON.stringify(products));
    return {
      'insertedCount': error.result.nInserted
    };
  }
};

module.exports.findBrand = async brand => {
  const db = await getDB();
  const collection = db.collection(MONGODB_COLLECTION);
  const products = await collection.find({brand: brand}).toArray();

  return products;
};

module.exports.findPrice = async price => {
  const db = await getDB();
  const collection = db.collection(MONGODB_COLLECTION);
  const products = await collection.find({price: {$lt: price}}).toArray();

  return products;
};

module.exports.findSorted = async () => {
  const db = await getDB();
  const collection = db.collection(MONGODB_COLLECTION);
  const products = await collection.find().sort({'price': 1}).toArray();

  return products;
};

module.exports.find = async query => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find(query).toArray();

    return result;
  } catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

module.exports.findAndSort = async (query, sort) => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find(query).sort(sort).toArray();

    return result;
  } catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

module.exports.findSortAndLimit = async (query, sort, limit) => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find(query).sort(sort).limit(limit).toArray();

    return result;
  } catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

/**
 * Close the connection
 */
module.exports.close = async () => {
  try {
    await client.close();
  } catch (error) {
    console.error('🚨 MongoClient.close...', error);
  }
};
