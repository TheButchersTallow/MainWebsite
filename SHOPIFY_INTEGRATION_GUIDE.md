# Shopify Integration Setup Guide

## Step-by-Step Instructions to Connect Your Website

### Step 1: Get Your Storefront Access Token

1. **Log into your Shopify Admin Dashboard**
   - Go to: `https://admin.shopify.com`

2. **Navigate to Settings → Apps and sales channels**
   - Click on "Settings" (bottom left)
   - Click "Apps and sales channels"

3. **Develop Apps**
   - Click "Develop apps" button (top right)
   - If you don't see this, click "Allow custom app development" first

4. **Create an App**
   - Click "Create an app"
   - App name: `Website Integration` (or any name you prefer)
   - App developer: Select yourself
   - Click "Create app"

5. **Configure Storefront API**
   - Click on "Configure Storefront API scopes"
   - Select these scopes:
     - ✅ `unauthenticated_read_product_listings`
     - ✅ `unauthenticated_read_product_inventory`
     - ✅ `unauthenticated_write_checkouts`
     - ✅ `unauthenticated_read_checkouts`
     - ✅ `unauthenticated_write_customers`
     - ✅ `unauthenticated_read_customers`
   - Click "Save"

6. **Install the App**
   - Click "Install app" button
   - Click "Install" to confirm

7. **Get Your Access Token**
   - After installation, you'll see "Storefront API access token"
   - Click "Reveal token once" (⚠️ IMPORTANT: Save this token somewhere safe!)
   - Copy this token - you'll need it for the website

---

### Step 2: Find Your Product IDs and Variant IDs

#### Method A: Using Shopify Admin (Easier)

1. **Go to Products in Shopify Admin**
   - Products → All products

2. **For Each Product:**
   - Click on the product name
   - Look at the URL in your browser
   - It will look like: `https://admin.shopify.com/store/YOUR-STORE/products/1234567890`
   - The number at the end (1234567890) is your Product ID

3. **For Product Variants:**
   - On the product page, scroll to "Variants" section
   - Click "Edit" on each variant
   - Look at the URL: `https://admin.shopify.com/store/YOUR-STORE/products/1234567890/variants/9876543210`
   - The last number (9876543210) is the Variant ID

#### Method B: Using GraphiQL App (More Technical)

1. **Install Shopify GraphiQL App**
   - Go to Shopify App Store
   - Search for "Shopify GraphiQL App"
   - Install it (it's free)

2. **Run This Query:**
```graphql
{
  products(first: 10) {
    edges {
      node {
        id
        title
        handle
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              sku
            }
          }
        }
      }
    }
  }
}
```

3. **Save the IDs:**
   - Product IDs will look like: `gid://shopify/Product/1234567890`
   - Variant IDs will look like: `gid://shopify/ProductVariant/9876543210`

---

### Step 3: Product Mapping

Fill out this information for each of your products:

#### 1. Tallow Lip Balm
- **Product ID:** ___________________________
- **Variants:**
  - Citrus: ___________________________
  - Vanilla Cinnamon: ___________________________
  - Peppermint: ___________________________
  - Unscented: ___________________________

#### 2. 100% All Purpose Suet Beef Tallow
- **Product ID:** ___________________________
- **Variants:**
  - Small Glass Jar: ___________________________
  - Medium Glass Jar: ___________________________
  - Large Glass Jar: ___________________________

#### 3. Whipped Tallow Balm
- **Product ID:** ___________________________
- **Variants:**
  - 1.25 oz - Unscented: ___________________________
  - 1.25 oz - Citrus: ___________________________
  - 1.25 oz - Frankincense & Lavender: ___________________________
  - 2.5 oz - Unscented: ___________________________
  - 2.5 oz - Citrus: ___________________________
  - 2.5 oz - Frankincense & Lavender: ___________________________

#### 4. Tallow Beard Balm
- **Product ID:** ___________________________
- **Variant ID:** ___________________________

#### 5. Tallow Leather Conditioner
- **Product ID:** ___________________________
- **Variant ID:** ___________________________

---

### Step 4: Share This Info With Me

Once you have:
1. ✅ Store Domain (e.g., `thebutcherstallow.myshopify.com`)
2. ✅ Storefront Access Token (the long string of letters and numbers)
3. ✅ Product IDs and Variant IDs (from the mapping above)

**Reply with this information and I'll integrate everything!**

---

## Need Help?

If you get stuck at any step, just tell me where you are and I'll help you troubleshoot!

## Security Note

⚠️ **NEVER share your access token publicly!** Only share it directly with me in this chat.


