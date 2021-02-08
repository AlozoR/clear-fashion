/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sources/dedicatedbrand');
const fs = require('fs');

const DEDICATED_BRAND = 'https://www.dedicatedbrand.com';

async function sandbox() {
  try {
    let allProducts = [];
    let count = 0;
    const pages = await dedicatedbrand.scrapeLinks();
    for (const page of pages) {
      console.log(`🕵️‍♀️  browsing ${page} source`);
      const products = await dedicatedbrand.scrape(page);
      // console.log(products);
      console.log('done');
      count += products.length;
      products.forEach(product => product.brand = 'DEDICATED');
      allProducts = allProducts.concat(products);
    }

    const json = JSON.stringify(allProducts, null, 2);
    fs.writeFile('products.json', json, 'utf8', () => {
      console.log(count);
      process.exit(0);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [, , eshop] = process.argv;

async function getPages() {
  let count = 0;
  const pages =
    await dedicatedbrand.scrapeLinks();
  for (const page of pages) {
    count += await sandbox(page);
  }
  console.log(count);
  process.exit(0);
}

sandbox(eshop);
