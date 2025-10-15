// Shopify Integration
class ShopifyIntegration {
    constructor() {
        this.client = null;
        this.storeDomain = 'your-store-name.myshopify.com'; // Replace with your actual store domain
        this.apiKey = 'your-api-key'; // Replace with your actual API key
        this.cart = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Shopify client (when you have your store set up)
            if (window.ShopifyBuy) {
                this.client = ShopifyBuy.buildClient({
                    domain: this.storeDomain,
                    storefrontAccessToken: this.apiKey
                });
                
                // Create cart
                this.cart = await this.client.checkout.create();
                this.isInitialized = true;
                
                console.log('Shopify client initialized successfully');
            }
        } catch (error) {
            console.log('Shopify not yet configured, using local cart functionality');
            this.isInitialized = false;
        }
    }
    
    async addToCart(productId, variantId, quantity = 1) {
        if (!this.isInitialized) {
            // Fallback to local cart functionality
            return this.addToLocalCart(productId, variantId, quantity);
        }
        
        try {
            const lineItemsToAdd = [{
                variantId: variantId,
                quantity: quantity
            }];
            
            this.cart = await this.client.checkout.addLineItems(this.cart.id, lineItemsToAdd);
            
            // Update UI
            this.updateCartUI();
            this.showSuccessMessage('Product added to cart!');
            
            return this.cart;
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showErrorMessage('Error adding product to cart');
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
        if (!this.isInitialized) {
            // Redirect to Shopify checkout or show message
            this.showCheckoutMessage();
            return;
        }
        
        try {
            // Redirect to Shopify checkout
            window.location.href = this.cart.webUrl;
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

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.getElementById('nav-menu');

mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

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
        
        this.init();
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
        
        // Add to cart buttons
        const addToCartBtns = document.querySelectorAll('.shopify-add-to-cart');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-product-id');
                const variantId = e.target.getAttribute('data-variant-id');
                
                // Add loading state
                e.target.classList.add('loading');
                e.target.disabled = true;
                
                // Use Shopify integration if available
                if (shopifyIntegration) {
                    shopifyIntegration.addToCart(productId, variantId).then(() => {
                        e.target.classList.remove('loading');
                        e.target.disabled = false;
                    });
                } else {
                    // Fallback to local cart
                    this.addToCart(productId);
                    e.target.classList.remove('loading');
                    e.target.disabled = false;
                }
            });
        });
        
        // Variant selector changes
        const variantSelectors = document.querySelectorAll('.variant-selector');
        variantSelectors.forEach(selector => {
            selector.addEventListener('change', (e) => {
                const productId = e.target.getAttribute('data-product');
                const selectedOption = e.target.options[e.target.selectedIndex];
                const variantId = selectedOption.getAttribute('data-variant-id');
                
                // Update the add to cart button
                const productCard = e.target.closest('.product-card');
                const addToCartBtn = productCard.querySelector('.shopify-add-to-cart');
                
                if (addToCartBtn) {
                    addToCartBtn.setAttribute('data-variant-id', variantId);
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
        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        
        // Update cart items display
        this.cartItems.innerHTML = '';
        
        if (this.items.length === 0) {
            this.cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Your cart is empty</p>';
        } else {
            this.items.forEach(item => {
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
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0; color: #3b2814;">${item.name}</h4>
                        <p style="margin: 0; color: #666;">$${item.price.toFixed(2)} each</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="cart.updateQuantity('${item.name}', -1)" style="background: none; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">-</button>
                        <span style="font-weight: 600;">${item.quantity}</span>
                        <button onclick="cart.updateQuantity('${item.name}', 1)" style="background: none; border: 1px solid #ddd; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">+</button>
                        <button onclick="cart.removeItem('${item.name}')" style="background: none; border: none; color: #ff4444; cursor: pointer; margin-left: 10px;">×</button>
                    </div>
                `;
                
                this.cartItems.appendChild(cartItem);
            });
        }
        
        // Update total
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.cartTotal.textContent = total.toFixed(2);
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
        this.cartModal.classList.toggle('active');
    }
    
    closeCartModal() {
        this.cartModal.classList.remove('active');
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

// Initialize cart when DOM is loaded
let cart;
document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
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
