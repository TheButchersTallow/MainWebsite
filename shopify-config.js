// Shopify Configuration File
// This file contains all the necessary configuration for Shopify integration

const SHOPIFY_CONFIG = {
    // Replace these with your actual Shopify store details
    storeDomain: 'your-store-name.myshopify.com',
    apiKey: 'your-storefront-access-token',
    
    // Product Configuration
    products: {
        'tallow-lip-balm': {
            shopifyProductId: 'gid://shopify/Product/YOUR_PRODUCT_ID',
            variants: {
                'vanilla-cinnamon': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID',
                'peppermint': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID',
                'orange-lemon': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID',
                'unscented': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID'
            }
        },
        'pure-beef-tallow': {
            shopifyProductId: 'gid://shopify/Product/YOUR_PRODUCT_ID',
            variants: {
                'dry-rendered': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID',
                'wet-rendered': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID'
            }
        }
    },
    
    // Analytics Configuration
    analytics: {
        googleAnalyticsId: 'GA_MEASUREMENT_ID',
        facebookPixelId: 'FACEBOOK_PIXEL_ID',
        shopifyAnalytics: true
    },
    
    // Checkout Configuration
    checkout: {
        redirectToCheckout: true,
        allowCheckout: true
    }
};

// Shopify Product Import Template
const SHOPIFY_PRODUCT_TEMPLATE = {
    "product": {
        "title": "Tallow Lip Balm",
        "body_html": "<p>Handmade lip balm with just four ingredients: tallow, beeswax, jojoba oil, and essential oils.</p>",
        "vendor": "The Butcher's Tallow",
        "product_type": "Skincare",
        "tags": ["lip-balm", "tallow", "natural", "handmade"],
        "variants": [
            {
                "title": "Vanilla Cinnamon",
                "price": "6.00",
                "sku": "TLB-VC-001",
                "inventory_management": "shopify",
                "inventory_quantity": 100
            },
            {
                "title": "Peppermint", 
                "price": "6.00",
                "sku": "TLB-PP-001",
                "inventory_management": "shopify",
                "inventory_quantity": 100
            },
            {
                "title": "Orange Lemon",
                "price": "6.00", 
                "sku": "TLB-OL-001",
                "inventory_management": "shopify",
                "inventory_quantity": 100
            },
            {
                "title": "Unscented",
                "price": "6.00",
                "sku": "TLB-UN-001", 
                "inventory_management": "shopify",
                "inventory_quantity": 100
            }
        ],
        "images": [
            {
                "src": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop"
            }
        ]
    }
};

// Shopify Integration Instructions
const SHOPIFY_SETUP_INSTRUCTIONS = `
SHOPIFY INTEGRATION SETUP INSTRUCTIONS:

1. CREATE SHOPIFY STORE:
   - Go to shopify.com and create your store
   - Choose a plan (Basic Shopify starts at $29/month)
   - Set up your store domain

2. GET STOREFRONT ACCESS TOKEN:
   - Go to Apps > App and sales channel settings
   - Click "Develop apps" > "Create an app"
   - Name your app (e.g., "Butcher's Tallow Website")
   - Configure Admin API access scopes:
     - read_products
     - write_products
     - read_inventory
     - write_inventory
   - Install the app and get the Storefront Access Token

3. UPDATE CONFIGURATION:
   - Replace 'your-store-name.myshopify.com' with your actual store domain
   - Replace 'your-storefront-access-token' with your actual token
   - Update product IDs and variant IDs in the products object

4. IMPORT PRODUCTS:
   - Use the Shopify Admin API or Shopify Admin to create products
   - Use the product template above as a reference
   - Update the product IDs in the configuration

5. TEST INTEGRATION:
   - Test adding products to cart
   - Test checkout flow
   - Verify analytics tracking

6. GO LIVE:
   - Update DNS settings to point to Shopify
   - Configure payment methods
   - Set up shipping rates
   - Test complete order flow

For more detailed instructions, visit:
https://shopify.dev/docs/admin-api/rest/reference/products/product
`;

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SHOPIFY_CONFIG,
        SHOPIFY_PRODUCT_TEMPLATE,
        SHOPIFY_SETUP_INSTRUCTIONS
    };
}
