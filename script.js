// Shopify Integration
class ShopifyIntegration {
    constructor() {
        this.client = null;
        // Use configuration from shopify-config.js
        this.storeDomain = SHOPIFY_CONFIG.storeDomain;
        this.apiKey = SHOPIFY_CONFIG.apiKey;
        this.config = SHOPIFY_CONFIG;
        this.cart = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        // Simplified approach: Use direct Shopify checkout URLs instead of SDK
        console.log('✅ Shopify integration ready (using direct checkout URLs)');
        this.isInitialized = true;
        
        // Load cart from localStorage
        this.loadCartFromStorage();
        
        // Update display if cart has items
        if (this.localCart.length > 0) {
            this.updateCartCount();
            if (window.cart) {
                window.cart.updateCartDisplay();
            }
        }
    }
    
    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('shopifyCart');
            if (savedCart) {
                this.localCart = JSON.parse(savedCart);
                console.log('🔄 Loaded cart from storage:', this.localCart.length, 'items');
            } else {
                this.localCart = [];
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.localCart = [];
        }
    }
    
    saveCartToStorage() {
        try {
            localStorage.setItem('shopifyCart', JSON.stringify(this.localCart));
            console.log('💾 Saved cart to storage');
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }
    
    async addToCart(productId, variantId, quantity = 1) {
        // Get the actual Shopify variant ID from config
        const shopifyVariantId = this.getShopifyVariantId(productId, variantId);
        
        if (!shopifyVariantId) {
            console.error('Variant ID not found in config for:', productId, variantId);
            this.showErrorMessage('Product variant not found');
            return;
        }
        
        // Extract just the numeric ID from the Shopify GID
        const numericVariantId = shopifyVariantId.split('/').pop();
        
        console.log('Adding to cart:', productId, variantId, '→', numericVariantId);
        
        // Add to local cart array
        const existingItem = this.localCart.find(item => item.shopifyVariantId === numericVariantId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.localCart.push({
                productId,
                variantId,  // Original variant ID like "citrus"
                shopifyVariantId: numericVariantId,  // Shopify numeric ID
                quantity,
                name: this.getProductName(productId, variantId)
            });
        }
        
        // Save to localStorage
        this.saveCartToStorage();
        
        // Update cart count and display
        this.updateCartCount();
        
        console.log('🔍 Checking for window.cart:', typeof window.cart, window.cart);
        
        // Update the cart display if it exists
        if (window.cart) {
            console.log('✅ window.cart exists, calling updateCartDisplay()');
            window.cart.updateCartDisplay();
        } else {
            console.error('❌ window.cart does NOT exist!');
        }
        
        this.showSuccessMessage('Product added to cart!');
        
        return true;
    }
    
    getShopifyVariantId(productId, variantId) {
        // Look up the variant ID from config
        const productConfig = this.config.products[productId];
        if (!productConfig) {
            return null;
        }
        
        const variantConfig = productConfig.variants[variantId];
        return variantConfig || null;
    }
    
    getProductName(productId, variantId) {
        const names = {
            'tallow-lip-balm': 'Tallow Lip Balm',
            'pure-beef-tallow': 'Pure Suet Beef Tallow',
            'whipped-tallow-balm': 'Whipped Tallow Balm',
            'beard-balm': 'Tallow Beard Balm',
            'leather-conditioner': 'Tallow Leather Conditioner'
        };
        return names[productId] || 'Product';
    }
    
    updateCartCount() {
        const totalItems = this.localCart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = totalItems;
            console.log(`🔢 Cart count updated: ${totalItems}`);
        } else {
            console.error('❌ cart-count element not found');
        }
    }
    
    updateCartQuantity(index, change) {
        if (this.localCart[index]) {
            this.localCart[index].quantity += change;
            
            // Remove if quantity is 0 or less
            if (this.localCart[index].quantity <= 0) {
                this.localCart.splice(index, 1);
            }
            
            // Save to localStorage
            this.saveCartToStorage();
            
            this.updateCartCount();
            if (window.cart) {
                cart.updateCartDisplay();
            }
        }
    }
    
    removeFromCart(index) {
        if (this.localCart[index]) {
            this.localCart.splice(index, 1);
            
            // Save to localStorage
            this.saveCartToStorage();
            
            this.updateCartCount();
            if (window.cart) {
                cart.updateCartDisplay();
            }
        }
    }
    
    addToLocalCart(productId, variantId, quantity = 1) {
        // Fallback local cart functionality
        const productData = this.getProductData(productId);
        const variant = productData.variants.find(v => v.id === variantId);
        
        if (!variant) {
            console.error('Variant not found');
            return;
        }
        
        // Add to local cart (existing functionality)
        if (window.cart) {
            window.cart.addToCart(productId);
        }
    }
    
    async checkout() {
        if (this.localCart.length === 0) {
            this.showErrorMessage('Your cart is empty');
            return;
        }
        
        try {
            // Build Shopify checkout URL
            // Format: https://STORE_DOMAIN/cart/VARIANT_ID:QUANTITY,VARIANT_ID:QUANTITY
            const cartItems = this.localCart.map(item => `${item.shopifyVariantId}:${item.quantity}`).join(',');
            const checkoutUrl = `https://${this.storeDomain}/cart/${cartItems}`;
            
            console.log('Redirecting to checkout:', checkoutUrl);
            
            // Redirect to Shopify checkout
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Error during checkout:', error);
            this.showErrorMessage('Error during checkout');
        }
    }
    
    getProductData(productId) {
        const productsData = document.getElementById('shopify-products-data');
        if (productsData) {
            const data = JSON.parse(productsData.textContent);
            return data.products.find(p => p.id === productId);
        }
        return null;
    }
    
    updateCartUI() {
        if (this.cart && this.cart.lineItems) {
            const cartCount = document.getElementById('cart-count');
            const cartTotal = document.getElementById('cart-total');
            
            if (cartCount) {
                const totalItems = this.cart.lineItems.reduce((sum, item) => sum + item.quantity, 0);
                cartCount.textContent = totalItems;
            }
            
            if (cartTotal) {
                cartTotal.textContent = this.cart.totalPrice.amount;
            }
        }
    }
    
    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }
    
    showCheckoutMessage() {
        this.showNotification('Checkout will be available when Shopify store is configured', 'info');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize Shopify Integration
let shopifyIntegration;
document.addEventListener('DOMContentLoaded', () => {
    shopifyIntegration = new ShopifyIntegration();
});

// Search Functionality
class ProductSearch {
    constructor() {
        this.searchBtn = document.getElementById('search-btn');
        this.searchModal = document.getElementById('search-modal');
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.closeSearch = document.getElementById('close-search');
        
        this.products = this.loadProducts();
        this.init();
    }
    
    init() {
        if (!this.searchBtn || !this.searchModal) return;
        
        this.searchBtn.addEventListener('click', () => this.openSearch());
        this.closeSearch.addEventListener('click', () => this.closeSearchModal());
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchModal.classList.contains('active')) {
                this.closeSearchModal();
            }
        });
        
        // Close on background click
        this.searchModal.addEventListener('click', (e) => {
            if (e.target === this.searchModal) {
                this.closeSearchModal();
            }
        });
        
        // Search on input
        this.searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
    }
    
    loadProducts() {
        const productsData = document.getElementById('shopify-products-data');
        if (productsData) {
            const data = JSON.parse(productsData.textContent);
            return data.products;
        }
        return [];
    }
    
    openSearch() {
        this.searchModal.classList.add('active');
        this.searchInput.value = '';
        this.searchInput.focus();
        this.searchResults.innerHTML = '<p class="search-hint">Start typing to search for products...</p>';
    }
    
    closeSearchModal() {
        this.searchModal.classList.remove('active');
        this.searchInput.value = '';
    }
    
    performSearch(query) {
        if (!query || query.trim().length < 2) {
            this.searchResults.innerHTML = '<p class="search-hint">Start typing to search for products...</p>';
            return;
        }
        
        const searchTerm = query.toLowerCase().trim();
        const results = this.products.filter(product => {
            return product.title.toLowerCase().includes(searchTerm) ||
                   product.description.toLowerCase().includes(searchTerm) ||
                   product.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        });
        
        this.displayResults(results);
    }
    
    displayResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try different keywords or browse all products</p>
                    <a href="shop-all.html" class="btn btn-primary">View All Products</a>
                </div>
            `;
            return;
        }
        
        this.searchResults.innerHTML = results.map(product => {
            const productUrl = this.getProductUrl(product.id);
            const price = product.price ? `$${product.price.toFixed(2)}` : 'View product';
            
            return `
                <a href="${productUrl}" class="search-result-item">
                    <img src="${product.image}" alt="${product.title}" class="search-result-image">
                    <div class="search-result-info">
                        <h4>${product.title}</h4>
                        <p>${product.description.substring(0, 80)}...</p>
                        <span class="search-result-price">${price}</span>
                    </div>
                </a>
            `;
        }).join('');
    }
    
    getProductUrl(productId) {
        const urlMap = {
            'tallow-lip-balm': 'products/lip-balm.html',
            'pure-beef-tallow': 'products/all-purpose-tallow.html',
            'whipped-tallow-balm': 'products/whipped-balm.html',
            'beard-balm': 'products/beard-balm.html',
            'leather-conditioner': 'products/leather-conditioner.html'
        };
        return urlMap[productId] || 'shop-all.html';
    }
}

// Review System
class ReviewSystem {
    constructor() {
        this.reviewModal = document.getElementById('review-modal');
        this.closeReviewModal = document.getElementById('close-review-modal');
        this.reviewForm = document.getElementById('review-form');
        this.starRating = document.getElementById('star-rating');
        this.ratingInput = document.getElementById('review-rating');
        this.currentRating = 0;
        
        this.reviews = this.loadReviews();
        this.init();
    }
    
    init() {
        if (!this.reviewModal) return;
        
        // Star rating click handlers
        if (this.starRating) {
            const stars = this.starRating.querySelectorAll('i');
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    this.setRating(parseInt(star.getAttribute('data-rating')));
                });
                
                star.addEventListener('mouseenter', () => {
                    this.highlightStars(parseInt(star.getAttribute('data-rating')));
                });
            });
            
            this.starRating.addEventListener('mouseleave', () => {
                this.highlightStars(this.currentRating);
            });
        }
        
        // Close modal handlers
        if (this.closeReviewModal) {
            this.closeReviewModal.addEventListener('click', () => this.closeModal());
        }
        
        this.reviewModal.addEventListener('click', (e) => {
            if (e.target === this.reviewModal) {
                this.closeModal();
            }
        });
        
        // Form submission
        if (this.reviewForm) {
            this.reviewForm.addEventListener('submit', (e) => this.submitReview(e));
        }
        
        // Add click handlers to "Write a Review" buttons
        document.querySelectorAll('.write-review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.getAttribute('data-product-id') || '';
                const productName = btn.getAttribute('data-product-name') || '';
                this.openModal(productId, productName);
            });
        });
    }
    
    setRating(rating) {
        this.currentRating = rating;
        this.ratingInput.value = rating;
        this.highlightStars(rating);
    }
    
    highlightStars(rating) {
        const stars = this.starRating.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }
    
    openModal(productId = '', productName = '') {
        this.reviewModal.classList.add('active');
        document.getElementById('review-product-id').value = productId;
        document.getElementById('review-product-name').value = productName;
        this.setRating(0);
        this.reviewForm.reset();
    }
    
    closeModal() {
        this.reviewModal.classList.remove('active');
        this.setRating(0);
        this.reviewForm.reset();
    }
    
    submitReview(e) {
        e.preventDefault();
        
        if (this.currentRating === 0) {
            alert('Please select a rating');
            return;
        }
        
        const formData = new FormData(this.reviewForm);
        const review = {
            id: Date.now(),
            productId: formData.get('product-id'),
            productName: formData.get('product-name'),
            name: formData.get('name'),
            email: formData.get('email'),
            rating: this.currentRating,
            title: formData.get('title'),
            text: formData.get('review'),
            verified: formData.get('verified') === 'on',
            date: new Date().toISOString(),
            approved: false // Reviews need moderation
        };
        
        // Save review to localStorage (temporary - replace with backend later)
        this.saveReview(review);
        
        // Show success message
        this.showNotification('Thank you! Your review has been submitted and is pending approval.', 'success');
        
        this.closeModal();
    }
    
    saveReview(review) {
        this.reviews.push(review);
        localStorage.setItem('product_reviews', JSON.stringify(this.reviews));
    }
    
    loadReviews() {
        const saved = localStorage.getItem('product_reviews');
        return saved ? JSON.parse(saved) : [];
    }
    
    getReviewsForProduct(productId) {
        return this.reviews.filter(review => 
            review.productId === productId && review.approved
        );
    }
    
    getAverageRating(productId) {
        const productReviews = this.getReviewsForProduct(productId);
        if (productReviews.length === 0) return 0;
        
        const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / productReviews.length).toFixed(1);
    }
    
    displayReviews(productId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const productReviews = this.getReviewsForProduct(productId);
        const averageRating = this.getAverageRating(productId);
        
        if (productReviews.length === 0) {
            container.innerHTML = `
                <div class="no-reviews">
                    <i class="fas fa-comment-slash"></i>
                    <h3>No reviews yet</h3>
                    <p>Be the first to share your experience with this product!</p>
                    <button class="btn btn-primary write-review-btn" data-product-id="${productId}">
                        <i class="fas fa-pen"></i> Write a Review
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="review-stats">
                <h3>Customer Reviews</h3>
                <div class="average-rating">${averageRating}</div>
                <div class="stars">
                    ${this.renderStars(parseFloat(averageRating))}
                </div>
                <p class="review-count-text">Based on ${productReviews.length} review${productReviews.length !== 1 ? 's' : ''}</p>
            </div>
            <div class="reviews-list">
                ${productReviews.map(review => this.renderReview(review)).join('')}
            </div>
        `;
    }
    
    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fas fa-star" style="color: ${i <= rating ? '#ffc107' : '#ddd'}"></i>`;
        }
        return stars;
    }
    
    renderReview(review) {
        const date = new Date(review.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        return `
            <div class="review-card">
                <div class="review-card-header">
                    <div class="reviewer-info">
                        <h4>${review.name}</h4>
                        <div class="stars">
                            ${this.renderStars(review.rating)}
                        </div>
                        <span class="review-date">${date}</span>
                        ${review.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified Purchase</span>' : ''}
                    </div>
                </div>
                <h5 class="review-title">${review.title}</h5>
                <p class="review-text">${review.text}</p>
            </div>
        `;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 4000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Mobile Menu Toggle with Overlay
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.getElementById('nav-menu');

// Create overlay element
let mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
if (!mobileMenuOverlay) {
    mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.className = 'mobile-menu-overlay';
    document.body.appendChild(mobileMenuOverlay);
}

// Function to close mobile menu
function closeMobileMenu() {
    if (navMenu) navMenu.classList.remove('active');
    if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
}

// Function to open mobile menu
function openMobileMenu() {
    if (navMenu) navMenu.classList.add('active');
    if (mobileMenuBtn) mobileMenuBtn.classList.add('active');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

if (mobileMenuBtn && navMenu) {
mobileMenuBtn.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}

// Close mobile menu when clicking outside the menu
document.addEventListener('click', function(e) {
    if (navMenu && navMenu.classList.contains('active')) {
        // Check if click is outside the menu and not on the menu button
        if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    }
});

// Mobile Dropdown Toggle
function setupMobileDropdowns() {
    // Handle dropdown parent links (toggle dropdown)
    const dropdownParents = document.querySelectorAll('.nav-menu .dropdown > .nav-link');
    
    dropdownParents.forEach(parentLink => {
        parentLink.addEventListener('click', function(e) {
            // Only toggle on mobile
            if (window.innerWidth <= 768) {
                e.preventDefault();
                
                const dropdown = this.parentElement;
                const isActive = dropdown.classList.contains('active');
                
                // Close all dropdowns
                document.querySelectorAll('.nav-menu .dropdown').forEach(d => {
                    d.classList.remove('active');
                });
                
                // Toggle current dropdown
                if (!isActive) {
                    dropdown.classList.add('active');
                }
            }
        });
    });
}

// Initialize mobile dropdowns when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMobileDropdowns);
} else {
    setupMobileDropdowns();
}

// Cart functionality
class ShoppingCart {
    constructor() {
        this.items = [];
        this.cartBtn = document.getElementById('cart-btn');
        this.cartModal = document.getElementById('cart-modal');
        this.cartCount = document.getElementById('cart-count');
        this.cartItems = document.getElementById('cart-items');
        this.cartTotal = document.getElementById('cart-total');
        this.closeCart = document.getElementById('close-cart');
        
        // Only initialize if elements exist
        if (this.cartBtn && this.closeCart && this.cartModal) {
            this.init();
        }
    }
    
    init() {
        
        this.cartBtn.addEventListener('click', () => this.toggleCart());
        this.closeCart.addEventListener('click', () => this.closeCartModal());
        
        // Close cart when clicking outside
        this.cartModal.addEventListener('click', (e) => {
            if (e.target === this.cartModal) {
                this.closeCartModal();
            }
        });
        
        // Variant selector changes - handle multiple selectors (size + scent)
        const variantSelectors = document.querySelectorAll('.variant-selector');
        variantSelectors.forEach(selector => {
            selector.addEventListener('change', (e) => {
                const productId = e.target.getAttribute('data-product');
                const productCard = e.target.closest('.product-card');
                const addToCartBtn = productCard.querySelector('.shopify-add-to-cart');
                
                if (!addToCartBtn) return;
                
                // Get all variant selectors for this product
                const allSelectors = productCard.querySelectorAll('.variant-selector[data-product="' + productId + '"]');
                
                // Combine selected values (e.g., "1.35oz-unscented")
                let combinedVariantId = '';
                allSelectors.forEach((sel, index) => {
                    const selectedOption = sel.options[sel.selectedIndex];
                    const variantPart = selectedOption.getAttribute('data-variant-id');
                    if (variantPart) {
                        if (combinedVariantId) {
                            combinedVariantId += '-' + variantPart;
                        } else {
                            combinedVariantId = variantPart;
                        }
                    }
                });
                
                // Update the add to cart button
                if (combinedVariantId) {
                    addToCartBtn.setAttribute('data-variant-id', combinedVariantId);
                    
                    // Update price if available
                    const selectedOption = e.target.options[e.target.selectedIndex];
                    const price = selectedOption.getAttribute('data-price');
                    if (price) {
                        const priceElement = productCard.querySelector('.product-price');
                        if (priceElement) {
                            priceElement.textContent = '$' + price;
                            priceElement.setAttribute('data-price', price);
                        }
                    }
                }
            });
        });
        
        // Shopify checkout button
        const shopifyCheckoutBtn = document.getElementById('shopify-checkout');
        if (shopifyCheckoutBtn) {
            shopifyCheckoutBtn.addEventListener('click', () => {
                if (shopifyIntegration) {
                    shopifyIntegration.checkout();
                } else {
                    shopifyIntegration.showCheckoutMessage();
                }
            });
        }
        
        // Continue shopping button
        const continueShoppingBtn = document.getElementById('continue-shopping');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                this.closeCartModal();
            });
        }
        
        this.updateCartDisplay();
    }
    
    addToCart(productName) {
        const product = this.getProductInfo(productName);
        const existingItem = this.items.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        
        this.updateCartDisplay();
        this.showAddedToCartMessage(product.name);
    }
    
    getProductDetails(productId, variantId) {
        // Map of product images (absolute paths starting with /)
        const productImages = {
            'tallow-lip-balm': '/assets/lip balm 4 pack.jpg',
            'pure-beef-tallow': '/assets/3 sizes of tallow.jpg',
            'whipped-tallow-balm': '/assets/3 kinds of whipped tallow balm.jpg',
            'beard-balm': '/assets/tallow beard balm front.jpg',
            'leather-conditioner': '/assets/tallow leather conditioner front.jpg'
        };
        
        // Map of prices for each variant
        const prices = {
            'tallow-lip-balm': { 'citrus': 8.00, 'vanilla-cinnamon': 8.00, 'peppermint': 8.00, 'unscented': 8.00 },
            'pure-beef-tallow': { 'small': 10.00, 'medium': 15.00, 'large': 25.00 },
            'whipped-tallow-balm': {
                '1.35oz-unscented': 25.00, '1.35oz-citrus': 25.00, '1.35oz-frankincense-lavender': 25.00,
                '2.5oz-unscented': 35.00, '2.5oz-citrus': 35.00, '2.5oz-frankincense-lavender': 35.00
            },
            'beard-balm': { 'beard-balm': 15.00 },
            'leather-conditioner': { 'leather-conditioner': 15.00 }
        };
        
        // Format variant name for display
        const formatVariant = (productId, variantId) => {
            if (productId === 'whipped-tallow-balm') {
                const [size, scent] = variantId.split('-');
                return `${size.toUpperCase()} - ${scent.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
            }
            return variantId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };
        
        const price = prices[productId] ? (prices[productId][variantId] || 0) : 0;
        const image = productImages[productId] || 'assets/placeholder.jpg';
        const variant = formatVariant(productId, variantId);
        
        return { price, image, variant };
    }
    
    getProductInfo(productName) {
        const products = {
            'lip-balm': {
                name: 'Tallow Lip Balm',
                price: 6.00,
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop'
            },
            'pure-tallow': {
                name: 'Pure Beef Tallow',
                price: 20.00,
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop'
            }
        };
        
        return products[productName] || { name: 'Product', price: 0, image: '' };
    }
    
    updateCartDisplay() {
        // Get items from Shopify integration instead of local items
        const cartItems = shopifyIntegration ? shopifyIntegration.localCart : this.items;
        
        console.log('🔄 Updating cart display with', cartItems.length, 'items:', cartItems);
        
        // Update cart count
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
        }
        
        // Update cart items display
        if (!this.cartItems) return;
        
        this.cartItems.innerHTML = '';
        
        if (cartItems.length === 0) {
            this.cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Your cart is empty</p>';
        } else {
            cartItems.forEach((item, index) => {
                // Get product details for display
                console.log('📦 Displaying cart item:', item);
                const productInfo = this.getProductDetails(item.productId, item.variantId);
                console.log('📦 Product info:', productInfo);
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px 0;
                    border-bottom: 1px solid #e5e5e5;
                `;
                
                cartItem.innerHTML = `
                    <img src="${productInfo.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0; color: #3b2814;">${item.name}</h4>
                        <p style="margin: 0; color: #666; font-size: 14px;">${productInfo.variant}</p>
                        <p style="margin: 5px 0 0 0; color: #666; font-weight: 600;">$${productInfo.price.toFixed(2)}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="shopifyIntegration.updateCartQuantity(${index}, -1)" style="background: none; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px;">-</button>
                        <span style="font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
                        <button onclick="shopifyIntegration.updateCartQuantity(${index}, 1)" style="background: none; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px;">+</button>
                        <button onclick="shopifyIntegration.removeFromCart(${index})" style="background: none; border: none; color: #ff4444; cursor: pointer; margin-left: 10px; font-size: 24px; font-weight: bold;">×</button>
                    </div>
                `;
                
                this.cartItems.appendChild(cartItem);
            });
        }
        
        // Calculate total from Shopify cart
        const total = cartItems.reduce((sum, item) => {
            const productInfo = this.getProductDetails(item.productId, item.variantId);
            return sum + (productInfo.price * item.quantity);
        }, 0);
        if (this.cartTotal) {
            this.cartTotal.textContent = total.toFixed(2);
        }
    }
    
    updateQuantity(productName, change) {
        const item = this.items.find(item => item.name === productName);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(productName);
            } else {
                this.updateCartDisplay();
            }
        }
    }
    
    removeItem(productName) {
        this.items = this.items.filter(item => item.name !== productName);
        this.updateCartDisplay();
    }
    
    toggleCart() {
        if (this.cartModal) {
            this.cartModal.classList.toggle('active');
        }
    }
    
    closeCartModal() {
        if (this.cartModal) {
            this.cartModal.classList.remove('active');
        }
    }
    
    showAddedToCartMessage(productName) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #3b2814;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = `${productName} added to cart!`;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .feature-item, .product-detail-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Form validation (if contact form is added later)
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ff4444';
            isValid = false;
        } else {
            input.style.borderColor = '#ddd';
        }
    });
    
    return isValid;
}

// Duplicate promo items for seamless marquee on mobile
function setupMobileMarquee() {
    if (window.innerWidth <= 768) {
        const promoContainers = document.querySelectorAll('.header-promo, .promo-banner');
        promoContainers.forEach(container => {
            // Get all original items
            const items = Array.from(container.querySelectorAll('.promo-item'));
            
            // Clear the container
            container.innerHTML = '';
            
            // Create a wrapper div that will animate
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexWrap = 'nowrap';
            wrapper.style.animation = 'scroll-marquee 30s linear infinite';
            wrapper.style.willChange = 'transform';
            wrapper.style.backfaceVisibility = 'hidden';
            wrapper.style.perspective = '1000px';
            
            // Add original items to wrapper and duplicate them many times for seamless loop
            // Using 20 sets ensures there's always content visible during loop
            for (let i = 0; i < 20; i++) {
                items.forEach(item => {
                    const clone = item.cloneNode(true);
                    clone.style.animation = 'none'; // Remove individual animation
                    wrapper.appendChild(clone);
                });
            }
            
            // Add wrapper to container
            container.appendChild(wrapper);
        });
    }
}

// Initialize cart, search, and reviews when DOM is loaded
let cart, productSearch, reviewSystem;
document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    window.cart = cart;  // Make cart accessible globally
    productSearch = new ProductSearch();
    reviewSystem = new ReviewSystem();
    setupMobileMarquee();
    
    // Add Shopify button listeners at document level (so they always work)
    console.log('📦 Setting up Shopify cart buttons...');
    const addToCartBtns = document.querySelectorAll('.shopify-add-to-cart, .add-to-cart-btn');
    console.log(`Found ${addToCartBtns.length} add-to-cart buttons (home + product pages)`);
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Try to get product data from button attributes or from selectors on page
            let productId = e.target.getAttribute('data-product-id');
            let variantId = e.target.getAttribute('data-variant-id');
            
            // If not on button, try to find from page (for product detail pages)
            if (!productId) {
                // Get product ID from URL and map to config ID
                const urlParts = window.location.pathname.split('/');
                const pageName = urlParts[urlParts.length - 1].replace('.html', '');
                
                // Map URL names to config product IDs
                const urlToProductMap = {
                    'lip-balm': 'tallow-lip-balm',
                    'all-purpose-tallow': 'pure-beef-tallow',
                    'whipped-balm': 'whipped-tallow-balm',
                    'beard-balm': 'beard-balm',
                    'leather-conditioner': 'leather-conditioner'
                };
                
                productId = urlToProductMap[pageName] || pageName;
                console.log('📍 Detected product from URL:', pageName, '→', productId);
            }
            
            // Get variant from selectors if not in button
            if (!variantId) {
                const sizeSelector = document.getElementById('size-select') || document.getElementById('whipped-balm-size');
                const scentSelector = document.getElementById('scent-select') || document.getElementById('whipped-balm-scent');
                
                if (sizeSelector && scentSelector) {
                    // Combined variant (e.g., whipped balm)
                    variantId = `${sizeSelector.value}-${scentSelector.value}`;
                } else if (sizeSelector) {
                    variantId = sizeSelector.value;
                } else if (scentSelector) {
                    variantId = scentSelector.value;
                }
                
                // If still no variant, check if product has a default/single variant
                if (!variantId && productId && SHOPIFY_CONFIG.products[productId]) {
                    const productVariants = Object.keys(SHOPIFY_CONFIG.products[productId].variants);
                    if (productVariants.length === 1) {
                        variantId = productVariants[0];
                        console.log('📍 Using default variant for single-variant product:', variantId);
                    }
                }
                
                if (variantId) {
                    console.log('📍 Detected variant from selectors:', variantId);
                }
            }
            
            // Get quantity from product page input if it exists
            let quantity = 1;
            const quantityInput = document.getElementById('quantity');
            if (quantityInput) {
                quantity = parseInt(quantityInput.value) || 1;
                console.log('📍 Detected quantity from input:', quantity);
            }
            
            console.log('🛒 Add to Cart clicked:', { productId, variantId, quantity, button: e.target.className });
            
            if (shopifyIntegration && productId && variantId) {
                console.log('✅ Using Shopify integration');
                shopifyIntegration.addToCart(productId, variantId, quantity);
            } else {
                console.log('❌ Missing data:', { shopifyIntegration: !!shopifyIntegration, productId, variantId });
            }
        });
    });
});

// Add to cart functionality for product cards
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        e.preventDefault();
        const productCard = e.target.closest('.product-card');
        const productName = e.target.getAttribute('data-product');
        
        if (productName) {
            cart.addToCart(productName);
        }
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    }
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (cart.cartModal.classList.contains('active')) {
            cart.closeCartModal();
        }
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    }
});

// Lazy loading for images
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));
