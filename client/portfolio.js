// Invoking strict mode
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let currentFilters = {
  'brand': '',
  'recently': 'off'
};

// inititiate selectors
const checkRecently = document.querySelector('#recently-check');
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};


/**
 * Render list of products
 * @param  {Array} products
 */
// const renderProducts = products => {
//   const fragment = document.createDocumentFragment();
//   const div = document.createElement('div');
//   div.innerHTML = products
//     .map(product => {
//       return `
//       <div class="product" id=${product.uuid}>
//         <span>${product.brand}</span>
//         <a href="${product.link}">${product.name}</a>
//         <span>${product.price}</span>
//       </div>
//     `;
//     })
//     .join('');
//   fragment.appendChild(div);
//   sectionProducts.innerHTML = '<h2>Products</h2>';
//   sectionProducts.appendChild(fragment);
// };


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  selectPage.innerHTML = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');
  selectPage.selectedIndex = currentPage - 1;
};


const renderBrands = products => {
  const brandNames = [''];
  for (const product of products) {
    if (!(brandNames.includes(product.brand))) {
      brandNames.push(product.brand);
    }
  }

  selectBrand.innerHTML = Array.from(
    brandNames,
    value => `<option value="${value}">${value}</option>`
  );
  selectBrand.selectedIndex = brandNames.indexOf(currentFilters['brand']);
};

const renderFilter = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  if (currentFilters['brand'] !== '') {
    products = products.filter(product =>
      product['brand'] === currentFilters['brand']);
  }
  if (currentFilters['recently'] === 'on') {
    products = products.filter(product =>
      (Date.now() - Date.parse(product.released)) / 1000 / 3600 / 24 < 90);
  }
  div.innerHTML = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  // renderProducts(products);
  renderPagination(pagination);
  renderBrands(products);
  renderFilter(products);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
 */
selectShow.addEventListener('change', event => {
  fetchProducts(currentPagination.currentPage, parseInt(event.target.value))
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value),
    currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectBrand.addEventListener('change', event => {
  currentFilters['brand'] = event.target.value;
  render(currentProducts, currentPagination);
});

checkRecently.addEventListener('change', () => {
  currentFilters['recently'] =
    currentFilters['recently'] === 'on' ? 'off' : 'on';
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
);
