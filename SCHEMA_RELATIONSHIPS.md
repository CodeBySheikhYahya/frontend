# Database Schema Relationships Diagram

## 📊 Visual Overview

```
┌─────────────┐
│ Categories  │
└──────┬──────┘
       │
       │ (1:N)
       │
┌──────▼──────┐      ┌──────────┐
│  Products   │──────│  Brands  │
└──────┬──────┘      └──────────┘
       │
       │ (1:N)
       │
┌──────▼──────────────┐
│ Product Variants    │
│ (Product+Color+Size)│
└───┬────────────┬───┘
    │            │
    │ (N:1)      │ (N:1)
    │            │
┌───▼───┐    ┌───▼───┐
│Colors │    │ Sizes │
└───────┘    └───────┘

┌─────────────┐
│  Products   │
└──────┬──────┘
       │
       ├─── (1:N) ───► Product Images
       ├─── (1:N) ───► Product Specifications
       └─── (1:N) ───► Reviews

┌─────────────┐
│    Users    │ (Supabase Auth)
└──────┬──────┘
       │
       ├─── (1:N) ───► Orders
       │                 │
       │                 └─── (1:N) ───► Order Items ───► Products
       │
       └─── (1:1) ───► Carts
                         │
                         └─── (1:N) ───► Cart Items ───► Product Variants
```

---

## 🔗 Table Relationships

### **Products & Related Data**

```
products
  ├── category_id → categories.id (Many products belong to one category)
  ├── brand_id → brands.id (Many products belong to one brand)
  │
  ├── product_variants (1:N)
  │     ├── product_id → products.id
  │     ├── color_id → colors.id
  │     └── size_id → sizes.id
  │
  ├── product_images (1:N)
  │     └── product_id → products.id
  │
  ├── product_specifications (1:N)
  │     └── product_id → products.id
  │
  └── reviews (1:N)
        └── product_id → products.id
```

### **Orders & Cart**

```
users (Supabase Auth)
  ├── orders (1:N)
  │     └── user_id → auth.users.id
  │           │
  │           └── order_items (1:N)
  │                 ├── order_id → orders.id
  │                 ├── product_id → products.id
  │                 └── variant_id → product_variants.id
  │
  └── carts (1:1)
        └── user_id → auth.users.id
              │
              └── cart_items (1:N)
                    ├── cart_id → carts.id
                    └── variant_id → product_variants.id
```

---

## 🎯 Key Design Decisions

### **1. Why Separate Variants Table?**
- **Problem:** One product (T-shirt) can have multiple colors and sizes
- **Solution:** `product_variants` table stores each combination
- **Benefit:** 
  - Track stock per variant
  - Different prices per variant (if needed)
  - Clean data structure

**Example:**
```
Product: "T-shirt with Tape Details"
Variants:
  - Blue + Small (stock: 10)
  - Blue + Medium (stock: 5)
  - Green + Large (stock: 8)
  - Brown + X-Large (stock: 0)
```

### **2. Why Separate Colors & Sizes Tables?**
- **Reusable:** Same colors/sizes used across all products
- **Consistent:** No typos or duplicates
- **Easy Updates:** Change color name once, updates everywhere
- **Efficient:** Small tables, fast lookups

### **3. Why Separate Images Table?**
- **Multiple Images:** Products can have galleries
- **Variant-Specific:** Some images might be for specific variants
- **Flexible:** Easy to reorder, add/remove images

### **4. Why Snapshot Order Items?**
- **Problem:** Product price/name might change after order
- **Solution:** Store product details at time of purchase
- **Benefit:** Order history shows what customer actually bought

---

## 📈 Query Patterns

### **Pattern 1: Get Product with All Variants**
```sql
SELECT 
  p.*,
  json_agg(DISTINCT jsonb_build_object(
    'id', v.id,
    'color', c.name,
    'size', s.name,
    'stock', v.stock_quantity
  )) as variants
FROM products p
LEFT JOIN product_variants v ON v.product_id = p.id
LEFT JOIN colors c ON c.id = v.color_id
LEFT JOIN sizes s ON s.id = v.size_id
WHERE p.id = '...'
GROUP BY p.id
```

### **Pattern 2: Get Available Variants Only**
```sql
SELECT v.*, c.name as color_name, s.name as size_name
FROM product_variants v
JOIN colors c ON c.id = v.color_id
JOIN sizes s ON s.id = v.size_id
WHERE v.product_id = '...'
  AND v.stock_quantity > 0
  AND v.is_active = true
```

### **Pattern 3: Get Products with Primary Image**
```sql
SELECT 
  p.*,
  pi.image_url as primary_image
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
WHERE p.is_active = true
```

---

## 🔒 Security Flow

### **Public Access (No Login Required):**
- ✅ View active products
- ✅ View categories, brands
- ✅ View colors, sizes
- ✅ View product images
- ✅ View approved reviews

### **User Access (Login Required):**
- ✅ Create reviews
- ✅ View own orders
- ✅ Create orders
- ✅ Manage own cart

### **Admin Access (Future):**
- ⚠️ Manage all products
- ⚠️ Manage orders
- ⚠️ Approve reviews
- ⚠️ Manage categories/brands

*(Admin policies not included - add later if needed)*

---

## 🚀 Performance Tips

1. **Use Indexes:** All foreign keys and common filters are indexed
2. **Limit Joins:** Only join what you need
3. **Use Select:** Specify columns, not `SELECT *`
4. **Pagination:** Always paginate product lists
5. **Cache:** Consider caching popular products

---

## 📝 Quick Reference

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `categories` | Product categories | name, slug, parent_id |
| `brands` | Brand information | name, slug, logo_url |
| `colors` | Available colors | name, hex_code |
| `sizes` | Available sizes | name |
| `products` | Main products | title, slug, price, category_id, brand_id |
| `product_variants` | Product combinations | product_id, color_id, size_id, stock_quantity |
| `product_images` | Product galleries | product_id, image_url, is_primary |
| `product_specifications` | Product details | product_id, spec_key, spec_value |
| `reviews` | Customer reviews | product_id, user_id, rating, content |
| `orders` | Customer orders | user_id, order_number, status, total_amount |
| `order_items` | Order line items | order_id, product_id, variant_id, quantity |
| `carts` | Shopping carts | user_id, session_id |
| `cart_items` | Cart line items | cart_id, variant_id, quantity |

---

This schema is **production-ready** and will scale with your business! 🎉






