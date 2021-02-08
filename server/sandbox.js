/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sources/dedicatedbrand');
const adresse = require('./sources/adresse');
const fs = require('fs');

async function sandbox() {
  try {
    let allProducts = [];
    const pages = await dedicatedbrand.scrapeLinks();
    for (const page of pages) {
      console.log(`🕵️‍♀️  browsing ${page} source`);
      const products = await dedicatedbrand.scrape(page);
      // console.log(products);
      console.log('done');
      products.forEach(product => product.brand = 'DEDICATED');
      allProducts = allProducts.concat(products);
    }

    let products = await adresse.scrape();
    products.forEach(product => product.brand = 'ADRESSE Paris');
    allProducts = allProducts.concat(products);
    const json = JSON.stringify(allProducts, null, 2);
    fs.writeFile('products.json', json, 'utf8', () => {
      console.log(allProducts.length);
      process.exit(0);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

// const [, , eshop] = process.argv;

fs.truncate('./products.json', 0, err => {
  sandbox();
});
