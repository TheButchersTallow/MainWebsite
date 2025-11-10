# The Butcher's Tallow - Features Guide

## 🔍 Search Functionality

### How to Use
1. Click the **search icon** (🔍) in the navigation bar
2. Type your search query (minimum 2 characters)
3. Results appear instantly as you type
4. Click on any result to go to that product page

### How It Works
- Searches product titles, descriptions, and tags
- Real-time search (no submit button needed)
- Press ESC or click outside to close
- Pulls data from the product JSON in each page

### Technical Details
- **File**: `script.js` - `ProductSearch` class
- **Storage**: Reads from `#shopify-products-data` JSON block
- **Keyboard shortcuts**: ESC to close, Enter to select first result

---

## ⭐ Review System

### Customer Features
1. **Submit Reviews**: Customers can write reviews for products
2. **Star Ratings**: 1-5 star rating system
3. **Verified Purchases**: Option to mark as verified purchaser
4. **Review Title & Text**: Detailed review with title and description

### Admin Features (TO DO - Requires Backend)
- **Moderation**: Reviews are saved with `approved: false` by default
- **Review Management**: Currently stored in `localStorage` (temporary)
- **Future**: Move to database with admin panel

### How Reviews Work

#### For Customers:
1. Navigate to a product page
2. Click "Write a Review" button
3. Fill out the review form:
   - Name (required)
   - Email (required, not published)
   - Star rating (required)
   - Review title (required)
   - Review text (required)
   - Verified purchase checkbox (optional)
4. Submit - review is pending approval

#### Current Storage:
- **Location**: Browser `localStorage` 
- **Key**: `product_reviews`
- **Format**: JSON array of review objects

```json
{
  "id": 1234567890,
  "productId": "tallow-lip-balm",
  "productName": "Tallow Lip Balm",
  "name": "Customer Name",
  "email": "customer@email.com",
  "rating": 5,
  "title": "Love this product!",
  "text": "Best lip balm I've ever used...",
  "verified": true,
  "date": "2025-10-22T10:00:00.000Z",
  "approved": false
}
```

### Review Display
- Only **approved** reviews are shown
- Displays average rating and review count
- Shows verified purchase badge
- Sorted by date (newest first)

### Technical Files
- **HTML**: Review modal in `index.html`, `shop-all.html`
- **CSS**: `.review-modal`, `.review-card` styles in `styles.css`
- **JavaScript**: `ReviewSystem` class in `script.js`

---

## 🛒 Preparing for Shopify Integration

### Current Status
✅ **Ready for Shopify:**
- Product data structure matches Shopify format
- Cart system compatible with Shopify Buy SDK
- Variant selectors ready
- SKU codes in place

⏳ **Needs Configuration:**
- Shopify store domain
- Storefront Access Token
- Product IDs and Variant IDs

### Step-by-Step Shopify Setup

#### 1. Create Shopify Store
1. Go to [shopify.com](https://www.shopify.com)
2. Start free trial or select a plan
3. Complete store setup
4. Choose your store domain (e.g., `thebutcherstallow.myshopify.com`)

#### 2. Generate Storefront Access Token
1. In Shopify Admin, go to **Apps** → **App and sales channel settings**
2. Click **Develop apps**
3. Click **Create an app**
4. Name it (e.g., "Website Integration")
5. Click **Configure Storefront API scopes**
6. Enable these scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_checkouts`
7. **Install app**
8. Copy the **Storefront Access Token**

#### 3. Add Products to Shopify
Use the product data from `index.html` (lines 474-629):
- Tallow Lip Balm (4 variants: Citrus, Vanilla Cinnamon, Peppermint, Unscented)
- All Purpose Suet Beef Tallow (3 sizes: Small $10, Medium $15, Large $25)
- Whipped Tallow Balm (6 variants: 2 sizes × 3 scents)
- Beard Balm ($15)
- Leather Conditioner ($15)

For each product, note down:
- **Product ID** (looks like: `gid://shopify/Product/1234567890`)
- **Variant IDs** for each option

#### 4. Update Configuration
Edit `shopify-config.js`:

```javascript
const SHOPIFY_CONFIG = {
    storeDomain: 'YOUR_STORE.myshopify.com',  // Replace
    apiKey: 'YOUR_STOREFRONT_ACCESS_TOKEN',    // Replace
    
    products: {
        'tallow-lip-balm': {
            shopifyProductId: 'gid://shopify/Product/YOUR_ID',
            variants: {
                'citrus': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID',
                'vanilla-cinnamon': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID',
                'peppermint': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID',
                'unscented': 'gid://shopify/ProductVariant/YOUR_VARIANT_ID'
            }
        },
        // ... add other products
    }
};
```

#### 5. Test Integration
1. Clear browser cache
2. Try adding products to cart
3. Test checkout flow
4. Verify inventory updates

#### 6. Configure Shopify Settings
- **Payments**: Set up payment processors (Shopify Payments, PayPal, etc.)
- **Shipping**: Configure shipping zones and rates
- **Taxes**: Set up tax calculations
- **Checkout**: Customize checkout experience
- **Notifications**: Configure order confirmation emails

### When Shopify is Connected
The system will automatically:
- ✅ Use Shopify cart instead of local storage
- ✅ Redirect to Shopify checkout
- ✅ Sync inventory
- ✅ Process real orders
- ✅ Handle payments

---

## 📝 Moving Reviews to Backend (Future Enhancement)

### Current Limitation
Reviews are stored in browser `localStorage`, which means:
- ❌ Reviews are local to each browser
- ❌ No admin moderation panel
- ❌ Reviews lost if user clears browser data

### Recommended Solution
Set up a backend API with:

#### Option 1: Shopify Reviews App
- Use Shopify's built-in review apps
- Examples: Yotpo, Judge.me, Loox
- Pros: Integrated with Shopify, SEO-friendly
- Cons: Monthly fee, limited customization

#### Option 2: Custom Backend (Firebase/Supabase)
```javascript
// Example using Firebase
const saveReview = async (review) => {
    const db = firebase.firestore();
    await db.collection('reviews').add({
        ...review,
        approved: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
};
```

#### Option 3: Form Service (Formspree/EmailJS)
- Submit reviews via email
- Manually approve and add to site
- Pros: Simple, no backend needed
- Cons: Manual process, not scalable

---

## 🎨 Customization Guide

### Adding New Products
1. Update the product JSON in `index.html` (line 474)
2. Add product card HTML to pages
3. Create product detail page in `products/` folder
4. Add product images to `assets/` folder
5. Update search results URL mapping in `script.js`

### Styling
- **Colors**: Defined in `styles.css` (brown theme)
- **Fonts**: Source Serif Pro, Source Sans Pro, Crimson Text
- **Layout**: CSS Grid and Flexbox

### Mobile Responsive
- Breakpoints: 768px and 480px
- Mobile menu with hamburger icon
- Touch-friendly buttons and links

---

## 🔧 Troubleshooting

### Search Not Working
- Check browser console for errors
- Verify `#shopify-products-data` exists on page
- Make sure `script.js` is loaded

### Reviews Not Saving
- Check browser `localStorage` permissions
- Try in incognito mode (some browsers block localStorage)
- Check browser console for errors

### Cart Issues
- Verify Shopify SDK is loaded (check network tab)
- Check `shopify-config.js` settings
- Review console for API errors

---

## 📞 Next Steps

### Immediate Priority
1. **Enable live Shopify checkout** by finalizing `shopify-config.js`, validating variant IDs, and testing real orders
2. **Launch production contact form** (Formspree, serverless function, or backend) so messages actually deliver
3. **Move product reviews to a persistent backend** with moderation instead of relying on local storage
4. **Implement analytics & tracking** (Google Analytics 4 + Meta Pixel) to capture conversion data
5. **Tighten SEO fundamentals**: add sitemap, structured product data, and fine-tune meta descriptions/titles

### Future Enhancements
- Newsletter signup integration
- Customer accounts
- Product recommendations
- Wishlist feature
- Live chat support
- Analytics integration (Google Analytics, Facebook Pixel)
- SEO improvements (Schema.org markup, sitemap)

---

**Questions?** Contact the developer or check the code comments in `script.js` for detailed technical documentation.

