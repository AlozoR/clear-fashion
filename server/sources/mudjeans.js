const axios = require('axios');
const cheerio = require('cheerio');

const DEDICATED_BRAND = 'https://www.dedicatedbrand.com';

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('.productList-container .productList')
    .map((i, element) => {
      const name = $(element)
        .find('.productList-title')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.productList-price')
          .text()
      );

      return {name, price};
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {string}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
  const response = await axios(url);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    return parse(data);
  }

  console.error(status);

  return null;
};


const parseLinks = data => {
  const $ = cheerio.load(data);

  return $('.mainNavigation-fixedContainer .mainNavigation-link-subMenu-link')
    .map((i, element) => {
      const link =  $(element)
        .find('a')
        //.find('.mainNavigation-link-subMenu-link > a[href]')
        .attr('href');

      return `${DEDICATED_BRAND}${link}`;
    })
    .get();
};


module.exports.scrapeLinks = async (url = DEDICATED_BRAND) => {
  const response = await axios(url);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    return parseLinks(data);
  }

  console.error(status);

  return null;
};
