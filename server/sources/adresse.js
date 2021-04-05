const axios = require('axios');
const cheerio = require('cheerio');
const {'v5': uuidv5} = require('uuid');

const ADRESSE = 'https://adresse.paris/630-toute-la-collection?id_category=630&n=109';

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('.ajax_block_product').not('.blocproduit')
    .map((i, element) => {
      const name = $(element)
        .find('.product-name')
        .attr('title');
      const price = parseInt(
        $(element)
          .find('.price.product-price')
          .text()
          .replace('€', '')
          .trim()
          .replace(/\s/g, ' ')
      );
      const photo = $(element)
        .find('.img-responsive.img_0')
        .attr('data-original');
      const link = $(element)
        .find('.product-name')
        .attr('href');
      const _id = uuidv5(link, uuidv5.URL);
      return {
        name,
        price,
        brand: 'adresse',
        photo,
        link,
        _id
      };
    })
    .get();
};


/**
 * Scrape all the products for a given url page
 * @param  {string}  url
 * @return {Array|null}
 */
module.exports.scrape = async (url = ADRESSE) => {
  const response = await axios(url);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    return parse(data);
  }

  console.error(status);

  return null;
};
