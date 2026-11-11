const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const sortBySelect = document.getElementById('sortBy');

const productsGrid = document.getElementById('productsGrid');

const cartSection = document.querySelector('.cart-section');
const cartList = document.getElementById('cartList');
const totalQuantityElem = document.getElementById('totalQuantity');
const totalPriceElem = document.getElementById('totalPrice');

const filterModalForm = document.getElementById('filterModalForm');
const filterModalCheckboxes = document.querySelectorAll('#filterModal input[type="checkbox"]');
const modalMinPrice = document.getElementById('modalMinPrice');
const modalMaxPrice = document.getElementById('modalMaxPrice');
const modalRatingSelect = document.getElementById('modalRatingSelect');
const modalApplyBtn = document.getElementById('modalApplyBtn');

const productDetailModal = document.getElementById('productDetailModal');
const detailImage = document.getElementById('detailImage');
const detailCategory = document.getElementById('detailCategory');
const detailTitle = document.getElementById('detailTitle');
const detailStars = document.getElementById('detailStars');
const detailRatingCount = document.getElementById('detailRatingCount');
const detailPrice = document.getElementById('detailPrice');
const detailDescription = document.getElementById('detailDescription');
const detailAddToCartBtn = document.getElementById('detailAddToCartBtn');

const BASE_URL = 'https://fakestoreapi.com';

let allProducts = [];
let activeProduct = null;
let cart = [];

async function fetchProducts({ route = '', id = null } = {}) {
    try {
        let url = `${BASE_URL}/products`;
        if (route) {
            url += route.startsWith('/') ? route : `/${route}`;
        } else if (id !== null && id !== undefined && id !== '') {
            url += `/${id}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Products request failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error fetching product data:', error);
        return [];
    }
}

async function fetchCarts({ route = '', id = null } = {}) {
    try {
        let url = `${BASE_URL}/carts`;

        if (id !== null && id !== undefined && id !== '') {
            url += `/${id}`;
        } else if (route) {
            url += route.startsWith('/') ? route : `/${route}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Carts request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error in fetchCarts:', error);
        return [];
    }
}

function renderProductCards(productList) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (!productList || productList.length === 0) {
        const noResults = document.createElement('p');
        noResults.style.color = '#fff';
        noResults.style.gridColumn = '1 / -1';
        noResults.style.textAlign = 'center';
        noResults.style.padding = '30px 0';
        noResults.textContent = 'No products found matching the criteria.';
        productsGrid.appendChild(noResults);
        return;
    }

    productList.forEach(product => {
        const article = document.createElement('article');
        article.className = 'product-card';
        article.dataset.id = product.id;
        article.dataset.category = product.category;
        article.dataset.price = product.price;
        article.dataset.rating = product.rating ? product.rating.rate : 0;

        article.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
      </div>
      <div class="card-content">
        <h3 class="product-title" title="${product.title}">${product.title}</h3>
        <div class="product-rating">
          <span class="stars"><i class="fa-solid fa-star"></i> ${product.rating ? product.rating.rate : 'N/A'}</span>
          <span class="rating-count">(${product.rating ? product.rating.count : 0} reviews)</span>
        </div>
        <div class="product-price">$${Number(product.price).toFixed(2)}</div>
        <div class="card-actions">
          <button type="button" class="btn btn-add-cart" data-id="${product.id}">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>
          <a href="#productDetailModal" class="btn-view-details" data-id="${product.id}" title="View Details">
            <i class="fa-solid fa-circle-info"></i> Details
          </a>
        </div>
      </div>
    `;

        article.querySelector('.btn-add-cart').addEventListener('click', () => {
            addToCart(product.id);
        });

        article.querySelector('.btn-view-details').addEventListener('click', () => {
            loadProductDetails(product.id);
        });

        productsGrid.appendChild(article);
    });
}

function renderCart() {
    if (!cartList) return;
    cartList.innerHTML = '';

    let totalQty = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'cart-item';
        emptyLi.style.opacity = '0.7';
        emptyLi.textContent = 'Your shopping cart is empty.';
        cartList.appendChild(emptyLi);
    } else {
        cart.forEach(item => {
            totalQty += item.quantity;
            totalPrice += item.price * item.quantity;

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.dataset.id = item.id;

            li.innerHTML = `
        <span class="cart-bullet">&bull;</span>
        <span class="cart-item-name">${item.title}</span>
        <span class="cart-item-price">– $${Number(item.price).toFixed(2)}</span>
        <span class="cart-item-qty">${item.quantity}</span>
        <button type="button" class="btn-remove" data-id="${item.id}">Remove</button>
      `;

            li.querySelector('.btn-remove').addEventListener('click', () => {
                removeFromCart(item.id);
            });

            cartList.appendChild(li);
        });
    }

    if (totalQuantityElem) totalQuantityElem.textContent = totalQty;
    if (totalPriceElem) totalPriceElem.textContent = `$${totalPrice.toFixed(2)}`;
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === Number(productId));
    if (!product) return;

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1
        });
    }
    renderCart();
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === Number(productId));
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
    }
    renderCart();
}

function loadProductDetails(productId) {
    const product = allProducts.find(p => p.id === Number(productId));
    if (!product) return;

    activeProduct = product;

    if (detailImage) {
        detailImage.src = product.image;
        detailImage.alt = product.title;
    }
    if (detailCategory) detailCategory.textContent = product.category;
    if (detailTitle) detailTitle.textContent = product.title;
    if (detailStars) detailStars.innerHTML = `<i class="fa-solid fa-star"></i> ${product.rating ? product.rating.rate : 'N/A'}`;
    if (detailRatingCount) detailRatingCount.textContent = `(${product.rating ? product.rating.count : 0} customer reviews)`;
    if (detailPrice) detailPrice.textContent = `$${Number(product.price).toFixed(2)}`;
    if (detailDescription) detailDescription.textContent = product.description;
}

function sortProducts(list, sortType) {
    const sorted = [...list];
    switch (sortType) {
        case 'name':
            return sorted.sort((a, b) => {
                const titleA = (a.title || '').trim().toLowerCase();
                const titleB = (b.title || '').trim().toLowerCase();

                if (titleB.startsWith(titleA)) return -1;
                if (titleA.startsWith(titleB)) return 1;

                return titleA.localeCompare(titleB);
            });
        case 'rating':
            return sorted.sort((a, b) => {
                const ratingA = a.rating ? a.rating.rate : 0;
                const ratingB = b.rating ? b.rating.rate : 0;
                return ratingB - ratingA;
            });

        case 'price':
            return sorted.sort((a, b) => a.price - b.price);

        case 'default':
        default:
            return sorted;
    }
}

function applyFilters() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const selectedCategory = categorySelect ? categorySelect.value : 'all';
    const minPrice = minPriceInput && minPriceInput.value !== '' ? parseFloat(minPriceInput.value) : null;
    const maxPrice = maxPriceInput && maxPriceInput.value !== '' ? parseFloat(maxPriceInput.value) : null;

    const currentSort = sortBySelect ? sortBySelect.value : 'default';
    const sortedList = sortProducts(allProducts, currentSort);

    const filteredList = sortedList.filter(product => {
        if (query && !product.title.toLowerCase().includes(query)) return false;
        if (selectedCategory !== 'all' && product.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        if (minPrice !== null && product.price < minPrice) return false;
        if (maxPrice !== null && product.price > maxPrice) return false;
        return true;
    });

    renderProductCards(filteredList);
}

if (modalApplyBtn) {
    modalApplyBtn.addEventListener('click', () => {
        const checkedCategories = Array.from(filterModalCheckboxes || [])
            .filter(cb => cb.checked)
            .map(cb => cb.value.toLowerCase());

        const minP = modalMinPrice && modalMinPrice.value !== '' ? parseFloat(modalMinPrice.value) : null;
        const maxP = modalMaxPrice && modalMaxPrice.value !== '' ? parseFloat(modalMaxPrice.value) : null;
        const minRating = modalRatingSelect ? parseFloat(modalRatingSelect.value) : 0;

        const currentSort = sortBySelect ? sortBySelect.value : 'default';
        const sortedList = sortProducts(allProducts, currentSort);

        const filtered = sortedList.filter(product => {
            if (checkedCategories.length > 0 && !checkedCategories.includes(product.category.toLowerCase())) return false;
            if (minP !== null && product.price < minP) return false;
            if (maxP !== null && product.price > maxP) return false;
            const rate = product.rating ? product.rating.rate : 0;
            if (minRating > 0 && rate < minRating) return false;
            return true;
        });

        renderProductCards(filtered);
        window.location.hash = ''; // close the modal
    });
}

if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
}

if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
}

if (categorySelect) {
    categorySelect.addEventListener('change', applyFilters);
}

if (sortBySelect) {
    sortBySelect.addEventListener('change', applyFilters);
}

if (detailAddToCartBtn) {
    detailAddToCartBtn.addEventListener('click', () => {
        if (activeProduct) {
            addToCart(activeProduct.id);
            window.location.hash = ''; // close the modal
        }
    });
}

async function initStore() {
    allProducts = await fetchProducts();

    renderProductCards(allProducts);

    renderCart();
}

initStore();
