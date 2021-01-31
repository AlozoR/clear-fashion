// Invoking strict mode
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
const currentFilters = {
  'brand': '',
  'recently': 'off',
  'reasonable': 'off',
  'favorite': 'off'
};
let currentSort = '';
let favorites = [];

// inititiate selectors
const checkRecently = document.querySelector('#recently-check');
const checkReasonable = document.querySelector('#reasonable-check');
const checkFavorite = document.querySelector('#favorite-check');
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const selectSort = document.querySelector('#sort-select');
// const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbNew = document.querySelector('#nbNew');
const spanp50 = document.querySelector('#p50');
const spanp90 = document.querySelector('#p90');
const spanp95 = document.querySelector('#p95');
const spanLastReleased = document.querySelector('#lastRelease');
// const thPrice = document.querySelector('#price-th');

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

const sortPrice = (a, b) => a.price - b.price;

const sortDate = (a, b) =>
  a.released < b.released ? -1 : a.released === b.released ? 0 : 1;

const percentileIndex = (products, percentile) =>
  Math.floor((products.length - 1) * percentile / 100) + 1;

const saveAsFavorite = event => {
  const uuid = event.currentTarget.getAttribute('data-id');
  if (favorites.some(p => p.uuid === uuid)) {
    favorites = favorites.filter(p => p.uuid !== uuid);
  } else {
    favorites.push(currentProducts.find(p => p.uuid === uuid));
  }
  render(currentProducts, currentPagination);
};


const filterProducts = products => {
  if (currentFilters['recently'] === 'on') {
    products = products.filter(product =>
      (Date.now() - Date.parse(product.released)) / 1000 / 3600 / 24 < 30);
  }
  if (currentFilters['favorite'] === 'on') {
    products = favorites;
  }
  if (currentFilters['reasonable'] === 'on') {
    products = products.filter(product => product.price < 100);
  }
  renderBrands(products);
  if (currentFilters['brand'] !== '') {
    products = products.filter(product =>
      product['brand'] === currentFilters['brand']);
  }

  return products;
};


const sortProducts = products => {
  switch (currentSort) {
  case 'price-asc':
    products.sort(sortPrice);
    break;
  case 'price-desc':
    products.sort(sortPrice).reverse();
    break;
  case 'date-asc':
    products.sort(sortDate);
    break;
  case 'date-desc':
    products.sort(sortDate).reverse();
    break;
  }
};


/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  // const fragment = document.createDocumentFragment();
  // const div = document.createElement('div');
  const table = document.querySelector('#product-table');
  table.innerHTML = products.map(product => {
    const star = favorites.some(p => p.uuid === product.uuid) ? '★' : '☆';
    return `
    <tr>
      <td>${product.brand}</td>
      <td><a href="${product.link}" target="_blank">${product.name}</a></td>
      <td>${product.price}</td>
      <td><button data-id="${product.uuid}" class="favorite">${star}</button></td>
    </tr>
    `;
  }).join('');


  // div.innerHTML = `
  // <table>
  //   <thead>
  //     <tr>
  //       <th>Brand</th>
  //       <th>Link to the product page</th>
  //       <th>Price</th>
  //       <th>Save as favorite</th>
  //     </tr>
  //    </thead>
  //    ${products.map(product => {
  //   const star = favorites.some(p => p.uuid === product.uuid) ? '★' : '☆';
  //   return `
  //   <tr>
  //     <td>${product.brand}</td>
  //     <td><a href="${product.link}" target="_blank">${product.name}</a></td>
  //     <td>${product.price}</td>
  //     <td><button data-id="${product.uuid}"
  // class="favorite">${star}</button></td> </tr> `; }).join('')} </table> `;

  // fragment.appendChild(div);
  // sectionProducts.innerHTML = '<h2>Products</h2>';
  // sectionProducts.appendChild(fragment);
};


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

/**
 * Render page selector
 * @param  {Object} products
 */
const renderIndicators = products => {
  spanNbProducts.innerHTML = products.length;
  spanNbNew.innerHTML = products.filter(product =>
    (Date.now() - Date.parse(product.released)) / 1000 / 3600 / 24 < 30)
    .length;
  if (products.length > 1) {
    const tempProd = [...products].sort(sortPrice);
    spanp50.innerHTML = tempProd[percentileIndex(tempProd, 50)].price;
    spanp90.innerHTML = tempProd[percentileIndex(tempProd, 90)].price;
    spanp95.innerHTML = tempProd[percentileIndex(tempProd, 95)].price;
    const lastReleasedProd = products
      .reduce((prev, current) =>
        prev.released > current.released ? prev : current);
    spanLastReleased.innerHTML = lastReleasedProd.released;
  }
};

const render = (products, pagination) => {
  products = filterProducts(products);
  sortProducts(products);
  renderProducts(products);
  document.querySelectorAll('.favorite').forEach(item =>
    item.addEventListener('click', saveAsFavorite, false));
  renderPagination(pagination);
  renderIndicators(products);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
 */
selectShow.addEventListener('change', event => {
  const page = Math.round(currentPagination.currentPage
    * (currentPagination.pageSize / parseInt(event.target.value)));
  fetchProducts(page, parseInt(event.target.value))
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

checkReasonable.addEventListener('change', () => {
  currentFilters['reasonable'] =
    currentFilters['reasonable'] === 'on' ? 'off' : 'on';
  render(currentProducts, currentPagination);
});

checkFavorite.addEventListener('change', () => {
  currentFilters['favorite'] =
    currentFilters['favorite'] === 'on' ? 'off' : 'on';
  render(currentProducts, currentPagination);
});

selectSort.addEventListener('change', event => {
  currentSort = event.target.value;
  render(currentProducts, currentPagination);
});

// thPrice.addEventListener('click', () => {
//   return undefined;
// });

document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
);
