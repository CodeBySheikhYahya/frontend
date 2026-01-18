# 🛍️ SHOP.CO - E-Commerce Clothing Store Application

## 📖 What This Application Is

**SHOP.CO** is a complete **online clothing store** (e-commerce platform) where customers can:
- Browse and shop for clothing items
- View product details with multiple images, colors, and sizes
- Add items to a shopping cart
- Place orders with shipping information
- Track their orders
- View customer reviews and ratings

Think of it like **Amazon** or **Zara's website** - but specifically for clothing items.

---

## 🎯 Main Purpose

This is a **full-stack e-commerce application** that allows:
1. **Customers** to shop online for clothing
2. **Store Administrators** to manage products, inventory, and orders

---

## 🏪 Customer-Facing Features (What Customers See)

### 1. **Homepage** (`/`)
- **Hero Section**: Eye-catching banner with call-to-action
- **Featured Brands**: Logos of popular brands (Zara, Gucci, Versace, Prada, Calvin Klein)
- **New Arrivals Section**: Latest products added to the store
- **Top Selling Products**: Best-selling items
- **Dress Style Showcase**: Visual categories (Casual, Formal, Party, Gym)
- **Customer Reviews**: Testimonials from satisfied customers

### 2. **Shop Page** (`/shop`)
- Browse all available products
- Filter by:
  - New Arrivals
  - Top Selling
  - On Sale (discounted items)
- Sort products by:
  - Most Popular
  - Price (Low to High)
  - Price (High to Low)
- Pagination to navigate through multiple pages of products
- Product cards showing:
  - Product image
  - Product name
  - Price (with discount if applicable)
  - Star rating

### 3. **Product Detail Page** (`/shop/product/[slug]`)
- **Product Gallery**: Multiple images (can view different angles)
- **Product Information**:
  - Title and description
  - Price (with discount percentage/amount shown)
  - Star rating and review count
- **Color Selection**: Choose from available colors (with visual color swatches)
- **Size Selection**: Choose from available sizes (Small, Medium, Large, etc.)
- **Add to Cart Button**: Adds selected variant (color + size) to cart
- **Product Details Tabs**:
  - Shipping & Returns information
  - Product specifications (material, care instructions, etc.)
  - Customer reviews and ratings
- **Related Products**: Suggestions for similar items

### 4. **Shopping Cart** (`/cart`)
- View all items added to cart
- See each item with:
  - Product image
  - Product name
  - Selected color and size
  - Quantity (can increase/decrease)
  - Price per item
  - Total price for that item
- **Order Summary**:
  - Subtotal (before discounts)
  - Discount amount
  - Delivery fee (currently free)
  - **Total amount**
- **Promo Code Section**: Enter discount codes (UI ready)
- **"Go to Checkout" Button**: Proceeds to checkout page

### 5. **Checkout Page** (`/checkout`)
- **Shipping Information Form**:
  - First Name
  - Last Name
  - Email Address
  - Phone Number
  - Street Address
  - City (dropdown with Pakistan cities)
  - ZIP Code
  - Country (default: Pakistan)
- **Order Summary** (sticky sidebar):
  - List of items being purchased
  - Subtotal
  - Discount
  - Total amount
- **Place Order Button**: Creates order and redirects to confirmation

### 6. **Order Confirmation** (`/orders/confirmation`)
- Success message
- Order number displayed
- What to expect next:
  - Order preparation
  - Shipping notification
  - Delivery instructions (for Cash on Delivery)

### 7. **Order Tracking** (`/orders`)
- Search for orders by order number
- View order details:
  - Order number
  - Order status (Pending, Processing, Shipped, Delivered, Cancelled)
  - Order date
  - Total amount
  - Link to view full order details

### 8. **Order Details Page** (`/orders/[id]`)
- Complete order information:
  - Order number and date
  - Shipping address
  - Payment method and status
  - List of all items ordered:
    - Product image
    - Product name
    - Color and size
    - Quantity
    - Price per item
    - Total for that item
  - Order summary:
    - Subtotal
    - Discount
    - Shipping
    - Tax
    - **Total amount**
  - Order status timeline

---

## 👨‍💼 Admin Panel Features (What Administrators See)

The admin panel is a separate section (`/admin`) where store managers can manage the entire store.

### **Admin Dashboard** (`/admin`)
- **Statistics Overview**:
  - Total Orders
  - Pending Orders
  - Completed Orders
  - Total Revenue (sum of all orders)
  - Total Products in catalog
- **Quick Actions**:
  - Manage Products
  - View Orders
  - Settings

### **Product Management** (`/admin/products`)

#### **Products List Page**
- View all products in a table:
  - Product image and name
  - Price
  - Status (Active/Inactive)
  - Category
  - Creation date
  - Actions: View, Edit, Delete
- **"Add Product" Button**: Create new products

#### **Add New Product** (`/admin/products/new`)
- **Basic Information**:
  - Product Title
  - Slug (URL-friendly name)
  - Description
  - Short Description
  - Base Price
  - Discount Type (Percentage or Fixed Amount)
  - Discount Value
- **Categorization**:
  - Category (dropdown)
  - Brand (dropdown)
  - Flags:
    - Featured Product
    - New Arrival
    - Top Selling
    - Active/Inactive
- **SEO Settings**:
  - Meta Title
  - Meta Description
- **Product Images**:
  - Upload multiple images
  - Set primary image
  - Reorder images
  - Delete images
- **Product Variants** (The Key Feature):
  - Add multiple color + size combinations
  - For each variant:
    - Select Color (or create new color)
    - Select Size (or create new size)
    - Stock Quantity
    - Price Override (optional - different price for this variant)
    - Active/Inactive status
  - Example: T-Shirt can have:
    - Blue + Small (Stock: 10)
    - Blue + Medium (Stock: 15)
    - Red + Large (Stock: 8)
    - etc.

#### **Edit Product** (`/admin/products/[id]/edit`)
- Same form as "Add Product" but pre-filled with existing data
- Can update all product information
- Can add/remove variants
- Can update stock quantities

### **Order Management** (`/admin/orders`)

#### **Orders List Page**
- View all customer orders in a table:
  - Order Number
  - Customer Name and Email
  - Order Date
  - Total Amount
  - Order Status (can change status via dropdown)
  - Payment Status (Paid, Pending, Failed, Refunded)
  - View Details button
- **Status Filter**: Filter orders by status:
  - All Orders
  - Pending
  - Processing
  - Shipped
  - Delivered
  - Cancelled
  - Refunded
- **Status Management**: Click on status dropdown to change order status

#### **Order Details Page** (`/admin/orders/[id]`)
- **Complete Order Information**:
  - Order Number
  - Customer Information
  - Shipping Address
  - Billing Address (if different)
- **Order Items**:
  - List of all products in the order
  - Quantity, price, and totals
- **Order Summary**:
  - Subtotal
  - Discount
  - Shipping
  - Tax
  - Total
- **Order Management**:
  - Update Order Status (dropdown)
  - Update Payment Status (dropdown)
  - Add Admin Notes (internal notes about the order)
  - Save changes button

---

## 🔄 How The Application Works (Flow)

### **Customer Shopping Flow:**

1. **Customer visits homepage**
   - Sees featured products, new arrivals, top sellers
   - Clicks on a product or "Shop" button

2. **Browses products**
   - Views product listings
   - Can filter by category, sort by price
   - Clicks on a product to see details

3. **Views product details**
   - Sees product images, description, reviews
   - Selects color and size
   - Clicks "Add to Cart"

4. **Manages cart**
   - Views cart page
   - Can adjust quantities
   - Can remove items
   - Clicks "Go to Checkout"

5. **Checks out**
   - Fills shipping information
   - Reviews order summary
   - Clicks "Place Order"

6. **Order confirmation**
   - Receives order number
   - Can track order status
   - Waits for delivery

### **Admin Management Flow:**

1. **Admin logs in**
   - Accesses `/admin` (protected route)
   - Views dashboard with statistics

2. **Adds new product**
   - Goes to Products → Add Product
   - Fills product information
   - Uploads images
   - Creates variants (color + size combinations)
   - Sets stock quantities
   - Saves product

3. **Manages orders**
   - Views orders list
   - Filters by status
   - Opens order details
   - Updates order status (e.g., Pending → Processing → Shipped → Delivered)
   - Updates payment status
   - Adds notes if needed

4. **Manages inventory**
   - Edits products to update stock
   - Deactivates out-of-stock items
   - Updates prices and discounts

---

## 🗄️ Database Structure (How Data is Organized)

The application uses **Supabase** (PostgreSQL database) with the following key concepts:

### **Products System:**
- **Products**: Main product information (name, price, description)
- **Product Variants**: Specific combinations (Product + Color + Size)
- **Product Images**: Gallery of photos for each product
- **Colors**: Reusable color list (Blue, Red, Green, etc.)
- **Sizes**: Reusable size list (Small, Medium, Large, etc.)
- **Categories**: Product categories (Casual, Formal, etc.)
- **Brands**: Brand names (Zara, Gucci, etc.)

### **Orders System:**
- **Orders**: Customer order records (shipping info, total, status)
- **Order Items**: Individual items in each order (product, variant, quantity, price)

### **Reviews System:**
- **Reviews**: Customer reviews and ratings for products

### **Why This Structure?**
- **One product** can have **multiple variants** (different colors and sizes)
- Each variant has its own **stock quantity**
- When customer buys "T-Shirt + Blue + Medium", the system knows exactly which variant and reduces stock accordingly

---

## 🔐 Admin Access Control

The admin panel is **protected** - only authorized users can access it.

### **How Admin Access Works:**
1. **Environment Variable Method** (Development):
   - Set `NEXT_PUBLIC_ADMIN_BYPASS=true` for testing
   - Or set `NEXT_PUBLIC_ADMIN_USER_IDS=user-id-1,user-id-2`

2. **Database Method** (Production):
   - Admin users stored in `admin_users` table
   - Two roles: `admin` and `super_admin`
   - Super admins can manage other admins

3. **User Metadata Method**:
   - Can set role in Supabase user metadata

---

## 💳 Payment System

Currently supports:
- **Cash on Delivery (COD)**: Customer pays when receiving the order
- Payment gateway integration was removed (PayFast was previously integrated)

---

## 🎨 Key Features

### **For Customers:**
✅ Browse products with filters and sorting  
✅ View detailed product information  
✅ Select colors and sizes  
✅ Shopping cart with quantity management  
✅ Checkout with shipping form  
✅ Order tracking  
✅ View order history  
✅ Product reviews and ratings  

### **For Administrators:**
✅ Dashboard with business statistics  
✅ Add/Edit/Delete products  
✅ Manage product variants (colors, sizes, stock)  
✅ Upload product images  
✅ Manage orders (view, update status)  
✅ Track payment status  
✅ Add admin notes to orders  
✅ Filter orders by status  

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit with Redux Persist (cart persists in browser)
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI (accessible components)
- **Styling**: Tailwind CSS with custom fonts (Integral CF, Satoshi)

---

## 📱 Responsive Design

The application is **fully responsive**:
- Works on desktop computers
- Works on tablets
- Works on mobile phones
- UI adapts to screen size automatically

---

## 🎯 Summary

**SHOP.CO** is a complete e-commerce solution where:

1. **Customers** can:
   - Shop for clothing online
   - Add items to cart
   - Place orders
   - Track their orders

2. **Administrators** can:
   - Manage product catalog
   - Control inventory (stock management)
   - Process and track orders
   - Monitor business statistics

It's like having a **physical clothing store** but online, with all the management tools needed to run the business efficiently.

---

**This application provides a complete end-to-end e-commerce experience for both customers and store administrators!** 🚀
