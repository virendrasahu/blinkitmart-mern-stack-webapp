# ⚡ BlinkitMart - 10-Minute Grocery Delivery Quick Commerce App

[![MERN Stack](https://img.shields.io/badge/Stack-MERN%20Stack-00ED64?style=for-the-badge&logo=mongodb)](https://github.com/virendrasahu)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS%20v3-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Payment-Razorpay%20SDK-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

A full-stack, production-grade **Quick Commerce (Grocery Delivery)** web application inspired by **Blinkit**. Built with the **MERN Stack** (MongoDB, Express.js, React 18, Node.js), featuring real-time location detection with Leaflet maps, high-accuracy browser Geolocation API, Cloudinary image uploads via Multer, 5-minute email OTP password resets, Razorpay payment gateway integration, persistent cart and wishlist systems, server-side Mongoose pagination, and a complete Admin Management Suite.

---

## 📋 Table of Contents

- [📌 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
  - [👤 Customer Features](#-customer-features)
  - [👑 Admin Features](#-admin-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ System Architecture](#️-system-architecture)
- [📁 Project Folder Structure](#-project-folder-structure)
- [🗄️ Database Schemas & Data Models](#️-database-schemas--data-models)
- [📡 Complete API Endpoints Reference](#-complete-api-endpoints-reference)
- [🔐 Authentication & Authorization Flow](#-authentication--authorization-flow)
- [🗺️ Location & Leaflet Map Address Management](#️-location--leaflet-map-address-management)
- [☁️ Multer & Cloudinary Image Upload Pipeline](#️-multer--cloudinary-image-upload-pipeline)
- [💳 Checkout & Payment System](#-checkout--payment-system)
- [👥 Admin User & Inventory Management](#-admin-user--inventory-management)
- [🔎 Search, Filtering & Pagination](#-search-filtering--pagination)
- [⚙️ Environment Variables Configuration](#️-environment-variables-configuration)
- [🚀 Installation & Setup Guide](#-installation--setup-guide)
- [🌱 Database Seeding](#-database-seeding)
- [🔑 1-Click Hiring Demo Accounts](#-1-click-hiring-demo-accounts)
- [🧪 Testing Guide](#-testing-guide)
- [🌐 Deployment Instructions](#-deployment-instructions)
- [🛡️ Security Practices](#️-security-practices)
- [❓ Common Errors & Troubleshooting](#-common-errors--troubleshooting)
- [🚀 Future Enhancements](#-future-enhancements)
- [💼 Interview Explanation & Resume Guide](#-interview-explanation--resume-guide)
- [📄 Educational Disclaimer](#-educational-disclaimer)

---

## 📌 Project Overview

**BlinkitMart** is a full-featured Quick Commerce platform designed to simulate modern 10-minute grocery delivery services. It connects customers with instant local dark-store product catalogs, interactive map-based location pickers, seamless online & COD payments, real-time order tracking timelines, and an administrative control panel for warehouse logistics and customer account management.

### Purpose
Developed as a comprehensive educational and hiring portfolio project demonstrating industrial-level software engineering practices, clean modular architecture, secure authentication, API validation, responsive UX design, and cloud media management.

---

## ✨ Key Features

### 👤 Customer Features

- **Auth Redirection & Direct Signup**:
  - Direct account registration with duplicate Email & Mobile number prevention.
  - Automatic redirection to Sign In page after successful signup with feedback alerts.
  - Secure login with JWT tokens stored in localStorage.
  - Deactivated user login guard (blocks suspended users with clear feedback).
  - 1-Click Hiring Demo Accounts autofill buttons (`Customer Demo` & `Admin Demo`).

- **5-Minute Email OTP Password Reset**:
  - Request 6-digit reset OTP delivered to registered Gmail via Nodemailer SMTP.
  - Expiration timer (5 minutes) and 60-second resend cooldown timer.

- **Profile & Cloudinary Avatar Upload**:
  - User profile management page (`/profile`).
  - Image file picker (JPG, PNG, WEBP max 5MB) with live preview before uploading.
  - Uploads image directly from frontend $\rightarrow$ Express Multer Memory Storage $\rightarrow$ Cloudinary CDN.

- **Blinkit-Style Location & Address Management**:
  - Header location bar displaying active delivery location.
  - "Change Location" modal powered by Leaflet & React-Leaflet with OpenStreetMap.
  - **High-Accuracy Geolocation API**: Detects exact GPS latitude/longitude using `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true })`.
  - Draggable marker & tap-on-map location selection.
  - Reverse-geocoding coordinates to readable street addresses via OpenStreetMap Nominatim API.
  - Saved addresses in MongoDB (`Home`, `Work`, `Other`) with full latitude and longitude storage.

- **Products Catalog & Real-Time Search**:
  - Categorized browsing (Fruits & Vegetables, Dairy & Breakfast, Munchies, Cold Drinks, etc.).
  - Real-time debounced search bar (`useDebounce.js`) matching product name, brand, or description.
  - Filtering by department category, price range (Min/Max), and sorting (Newest, Price Low-to-High, Price High-to-Low, Rating, Popularity).
  - Product Details Modal (`ProductDetailsModal.jsx`) with MRP savings badges and stock availability.

- **Homepage & "See All" Navigation**:
  - Device-responsive HTML5 `<picture>` hero banners (`Banner.jpg` desktop, `TabletBanner.png` tablet, `MobileBanner.png` mobile).
  - Section limits (6–12 products) with **"See All"** buttons leading to complete paginated catalog pages.

- **Cart & Wishlist System**:
  - Instant Wishlist heart toggle saved directly in user's MongoDB document.
  - Slide-out Cart Drawer (`CartDrawer.jsx`) with quantity increase/decrease, item removal, and live bill breakdown (Subtotal, Delivery Fee, Handling Fee, Discount, Grand Total).

- **Checkout & Real-Time Order Tracking**:
  - Address selection & order review.
  - **Razorpay Test Mode Payment** (SDK modal popup) & **Cash on Delivery (COD)**.
  - Automatic inventory stock deduction on purchase, and stock restoration on order cancellation.
  - Order history page (`/orders`) with 5-stage progress timeline (Placed $\rightarrow$ Confirmed $\rightarrow$ Preparing $\rightarrow$ On the Way $\rightarrow$ Delivered).
  - 1-Click Reorder button to reload previous order items into cart.

- **Responsive Footer with Circular Social Media Icons**:
  - Dark circular social media buttons matching brand identities (LinkedIn, GitHub, Instagram, YouTube) with scale-up micro-interactions and responsive device sizing.

---

### 👑 Admin Features

- **Protected Admin Suite (`/admin`)**:
  - Multi-layer protection using `protect` (JWT authentication) and `adminOnly` (role verification) middleware.

- **Executive Analytics Dashboard (`/admin`)**:
  - Real-time metrics: Total Revenue, Total Orders, Total Registered Customers, Active Product Count, Low Stock Alerts, and Recent Orders feed.

- **Product Inventory Management (`/admin/products`)**:
  - Add, edit, or delete products.
  - File picker upload for product photos directly to Cloudinary cloud storage.
  - Update selling price, MRP, unit size, stock count, and active status.
  - Server-side pagination and search filter.

- **Category Management (`/admin/categories`)**:
  - Create and manage store departments with Cloudinary image upload.

- **Order Logistics & Fulfillment (`/admin/orders`)**:
  - View store orders with customer shipping addresses and bill totals.
  - Update live order delivery status (`PLACED`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).

- **Customer User Management (`/admin/users`)**:
  - View complete customer account details modal.
  - Edit customer profile (Name, Email, Mobile Number, Avatar photo upload, Role, and Active status).
  - Single-click Activate / Deactivate account status toggle.
  - Delete user account confirmation modal.
  - **Self-Action Security Rules**: Prevents logged-in admin from deactivating, demoting, or deleting their own account.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Core** | React 18 (`react@18.3.1`), React DOM, Vite (`vite@5.4.0`) |
| **Routing & State** | React Router DOM v6 (`react-router-dom@6.26.0`), React Context API (`AuthContext`, `AppContext`, `CartContext`) |
| **Styling & Icons** | Vanilla CSS, TailwindCSS v3 (`tailwindcss@3.4.9`), React Icons (`react-icons/fi`, `react-icons/fa`) |
| **Interactive Maps** | Leaflet (`leaflet@1.9.4`), React Leaflet (`react-leaflet@4.2.1`), OpenStreetMap Tile Layer |
| **Notifications & HTTP** | React Toastify (`react-toastify@10.0.5`), Axios (`axios@1.7.4`) |
| **Backend Runtime** | Node.js (v18+ / v22+), Express.js (`express@4.19.2`) |
| **Database & ORM** | MongoDB Atlas, Mongoose ORM (`mongoose@8.5.2`) |
| **Authentication & Hashing**| JSON Web Tokens (`jsonwebtoken@9.0.2`), bcryptjs (`bcryptjs@2.4.3`) |
| **File Handling & Cloud** | Multer (`multer@1.4.5-lts.1`), Cloudinary SDK (`cloudinary@2.4.0`) |
| **Mailing & Payments** | Brevo Email HTTP API (`api.brevo.com/v3/smtp/email`), Razorpay Node SDK (`razorpay@2.9.4`) |
| **Security & Middleware** | Helmet (`helmet@7.1.0`), CORS (`cors@2.8.5`), Cookie Parser (`cookie-parser@1.4.6`) |

---

## 🏗️ System Architecture

```
[ Customer / Admin Browser ]
         │
         ├──► React 18 SPA (Vite)
         │       ├── Context API (Auth, Cart, Location)
         │       ├── Leaflet OpenStreetMap Geolocation API
         │       └── Axios HTTP Client (Interceptors)
         │
         ▼
[ Express.js REST API Server (Port 5000) ]
         │
         ├── Middleware (JWT Protect, AdminOnly, Multer Storage, Helmet)
         │
         ├──► MongoDB Atlas (Users, Products, Categories, Orders, Cart, Address)
         ├──► Cloudinary CDN (Profile Avatars, Product Images)
         ├──► Nodemailer Gmail SMTP (5-Min Reset OTP Emails)
         └──► Razorpay Gateway API (Payment Orders & Signature Verification)
```

---

## 📁 Project Folder Structure

```
BlinkIt-Clone-Full-Stack-Ecommerce-main/
├── backend/                        # Express.js Node Server
│   ├── config/
│   │   └── db.js                   # MongoDB Atlas Mongoose Connection
│   ├── controllers/
│   │   ├── addressController.js    # Address Management & Geocoding APIs
│   │   ├── adminController.js      # Dashboard Metrics & User/Product Admin APIs
│   │   ├── authController.js       # Register, Login, Me, Forgot/Reset Password OTP
│   │   ├── cartController.js       # User Cart CRUD APIs
│   │   ├── categoryController.js   # Category Management APIs
│   │   ├── couponController.js     # Discount Coupon APIs
│   │   ├── orderController.js      # Order Creation, Paginated History & Status APIs
│   │   ├── paymentController.js    # Razorpay Order & Signature Verification APIs
│   │   ├── productController.js    # Paginated Product Catalog & Search APIs
│   │   ├── userController.js       # User Profile & Avatar Upload APIs
│   │   └── wishlistController.js   # Wishlist Add/Remove APIs
│   ├── middleware/
│   │   ├── adminMiddleware.js      # Admin Role Verification Guard
│   │   ├── authMiddleware.js       # JWT Authorization Token Guard
│   │   └── uploadMiddleware.js     # Multer Memory Storage File Parser
│   ├── models/
│   │   ├── Address.js              # MongoDB Address Schema (Coordinates + Full Address)
│   │   ├── Cart.js                 # MongoDB Cart Schema
│   │   ├── Category.js             # MongoDB Category Schema
│   │   ├── Coupon.js               # MongoDB Coupon Schema
│   │   ├── Order.js                # MongoDB Order Schema
│   │   ├── Product.js              # MongoDB Product Schema
│   │   └── User.js                 # MongoDB User Schema (Password Hash + OTP + Status)
│   ├── routes/
│   │   ├── addressRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   ├── userRoutes.js
│   │   └── wishlistRoutes.js
│   ├── seed/
│   │   └── seedProducts.js         # Database Seeder Script
│   ├── utils/
│   │   ├── calculatePrice.js       # Cart Subtotal & Bill Breakdown Utility
│   │   ├── generateOrderId.js      # Unique Human-Readable Order ID Generator
│   │   ├── generateToken.js        # JWT Token Signer
│   │   ├── sendEmail.js            # Nodemailer Transporter Utility
│   │   └── uploadImageClodinary.js # Cloudinary Upload Stream Helper
│   ├── .env                        # Environment Configuration (Git-Ignored)
│   ├── .env.example                # Template Environment File
│   ├── package.json
│   └── server.js                   # Main Entry Point
│
├── frontend/                       # Vite React 18 SPA
│   ├── public/
│   ├── src/
│   │   ├── assets/                 # Responsive Banner Assets (Banner.jpg, etc.)
│   │   ├── components/
│   │   │   ├── address/
│   │   │   │   └── LocationModal.jsx # Leaflet Interactive Map & Geolocation Modal
│   │   │   ├── admin/
│   │   │   │   └── AdminLayout.jsx   # Admin Navigation Sidebar & Top Bar
│   │   │   ├── cart/
│   │   │   │   └── CartDrawer.jsx    # Slide-Out Cart Component
│   │   │   ├── common/
│   │   │   │   ├── Footer.jsx        # Responsive Footer with Social Icons
│   │   │   │   ├── Header.jsx        # Sticky Header, Location Bar & Search
│   │   │   │   └── Pagination.jsx    # Reusable Numeric & Prev/Next Pagination
│   │   │   └── product/
│   │   │       ├── ProductCard.jsx   # Interactive Product Card with Add Button
│   │   │       └── ProductDetailsModal.jsx # Product Quick View Modal
│   │   ├── context/
│   │   │   ├── AppContext.jsx        # Location & Global UI State Context
│   │   │   ├── AuthContext.jsx       # Auth State & Token Management Context
│   │   │   └── CartContext.jsx       # Cart State & Sync Context
│   │   ├── pages/
│   │   │   ├── Admin/                # Admin Management Views (Products, Orders, Users)
│   │   │   ├── Auth/                 # Login, Register & ForgotPassword Views
│   │   │   ├── Checkout/             # Checkout View
│   │   │   ├── Home/                 # Homepage, Banners, Category Grids
│   │   │   ├── Orders/               # Order History & Tracking View
│   │   │   ├── Products/             # Product Catalog & Search Views
│   │   │   ├── Profile/              # Profile View
│   │   │   └── Wishlist/             # Wishlist View
│   │   ├── services/
│   │   │   ├── api.js                # Axios Instance with Auth Interceptors
│   │   │   ├── authService.js
│   │   │   ├── cartService.js
│   │   │   ├── orderService.js
│   │   │   ├── productService.js
│   │   │   └── wishlistService.js
│   │   ├── utils/
│   │   │   └── useDebounce.js        # Debounce Hook for Search Input
│   │   ├── App.jsx                   # Application Routes Configuration
│   │   ├── main.jsx                  # Entry Point
│   │   └── index.css                 # Global Styles & Leaflet CSS Import
│   ├── .env                        # Frontend Environment Configuration
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md                       # Documentation
```

---

## 🗄️ Database Schemas & Data Models

### 1. User Schema (`User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  avatar: { type: String, default: 'https://images.unsplash.com/...' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  resetPasswordOtp: { type: String, default: null },
  resetPasswordOtpExpiry: { type: Date, default: null }
}
```

### 2. Product Schema (`Product.js`)
```javascript
{
  name: { type: String, required: true },
  description: { type: String, default: '' },
  brand: { type: String, default: 'Fresh' },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  unit: { type: String, default: '1 unit' },
  image: { type: String, required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 50 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}
```

### 3. Address Schema (`Address.js`)
```javascript
{
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  houseNo: { type: String, required: true },
  street: { type: String, required: true },
  landmark: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  fullAddress: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}
```

### 4. Order Schema (`Order.js`)
```javascript
{
  orderId: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String, quantity: Number, price: Number, mrp: Number, image: String, unit: String
  }],
  shippingAddress: {
    fullName: String, phone: String, houseNo: String, street: String, city: String, state: String, pincode: String
  },
  paymentMethod: { type: String, enum: ['COD', 'RAZORPAY'], default: 'COD' },
  paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  orderStatus: { type: String, enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'], default: 'PLACED' },
  totalAmount: { type: Number, required: true }
}
```

---

## 📡 Complete API Endpoints Reference

### 🔑 Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/forgot-password` | Public | Send 5-minute 6-digit reset OTP via email |
| `POST` | `/api/auth/reset-password` | Public | Reset password using email & OTP |
| `GET` | `/api/auth/me` | Private | Get currently logged-in user profile |
| `POST` | `/api/auth/logout` | Public | Clear auth session |

### 🛒 Product Routes (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Get products with search, filters, sorting & pagination |
| `GET` | `/api/products/featured` | Public | Get trending homepage products |
| `GET` | `/api/products/:id` | Public | Get product details & related items |
| `POST` | `/api/products` | Admin | Create product with Multer + Cloudinary image upload |
| `PUT` | `/api/products/:id` | Admin | Update product details or stock |
| `DELETE`| `/api/products/:id` | Admin | Delete product |

### 📂 Category Routes (`/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Get all active store categories |
| `POST` | `/api/categories` | Admin | Create category with Cloudinary image |
| `PUT` | `/api/categories/:id` | Admin | Update category details |
| `DELETE`| `/api/categories/:id` | Admin | Delete category |

### 🛍️ Cart Routes (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Private | Fetch logged-in user's cart |
| `POST` | `/api/cart/add` | Private | Add item to cart or increment quantity |
| `PUT` | `/api/cart/update` | Private | Update item quantity |
| `DELETE`| `/api/cart/remove/:productId` | Private | Remove item from cart |
| `DELETE`| `/api/cart/clear` | Private | Empty user cart |

### ❤️ Wishlist Routes (`/api/wishlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | Private | Get logged-in user's wishlist products |
| `POST` | `/api/wishlist/toggle` | Private | Add/Remove product from wishlist |

### 📍 Address Routes (`/api/address`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/address` | Private | Get saved addresses for user |
| `POST` | `/api/address` | Private | Save new address with lat/lng coordinates |
| `PUT` | `/api/address/:id` | Private | Update saved address |
| `DELETE`| `/api/address/:id` | Private | Delete saved address |
| `PATCH` | `/api/address/:id/default` | Private | Set active default delivery address |

### 📦 Order Routes (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Private | Create order & deduct product inventory stock |
| `GET` | `/api/orders` | Private | Get user order history with pagination |
| `GET` | `/api/orders/all` | Admin | Get all store orders with pagination |
| `GET` | `/api/orders/:id` | Private | Get single order details |
| `PUT` | `/api/orders/:id/status` | Admin | Update delivery & payment status |
| `PUT` | `/api/orders/:id/cancel` | Private | Cancel order & restore inventory stock |

### 💳 Payment Routes (`/api/payment`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payment/create-order` | Private | Create Razorpay Order ID |
| `POST` | `/api/payment/verify` | Private | Verify Razorpay HMAC-SHA256 signature |

### 👑 Admin Routes (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | Get revenue, order, and stock analytics |
| `GET` | `/api/admin/users` | Admin | Get customer list with search & pagination |
| `GET` | `/api/admin/users/:id` | Admin | Get single user account details |
| `PUT` | `/api/admin/users/:id` | Admin | Edit user profile & avatar photo |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Quick Activate/Deactivate user status |
| `DELETE`| `/api/admin/users/:id` | Admin | Delete user account (cannot delete self) |

---

## 🔐 Authentication & Authorization Flow

```
[ User Register / Login ] ──► [ Passwords Hashed via Bcrypt ]
                                       │
                                       ▼
[ Authorization Header ] ◄─── [ JWT Token Returned ]
(Bearer <jwt_token>)
         │
         ├──► protect Middleware (Decodes JWT token & populates req.user)
         │
         └──► adminOnly Middleware (Verifies req.user.role === 'admin')
```

---

## 🗺️ Location & Leaflet Map Address Management

1. User clicks **"Location Selector"** in the top navigation bar.
2. User selects **"Detect My Location"**:
   - Application requests `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true })`.
   - Obtains high-accuracy GPS coordinates (`latitude`, `longitude`).
   - Moves map marker smoothly and calls `map.invalidateSize()` to eliminate grey tile glitches.
   - Reverse-geocodes exact coordinates to street address via OpenStreetMap Nominatim API.
3. User can also drag the marker or tap on the interactive map to adjust coordinates.
4. Saving address stores `latitude`, `longitude`, `houseNo`, `street`, `landmark`, `city`, `state`, `pincode`, and `fullAddress` in MongoDB.

---

## ☁️ Multer & Cloudinary Image Upload Pipeline

```
[ User selects Image File (PNG, JPG, WEBP) ]
                    │
                    ▼
[ Multipart/Form-Data Axios Request ]
                    │
                    ▼
[ Multer Memory Storage Middleware ] (Parses req.file.buffer in RAM)
                    │
                    ▼
[ Cloudinary Stream Upload Helper ] (uploadImageClodinary.js)
                    │
                    ▼
[ Returns Secure CDN Image URL ] ──► Stored in MongoDB (Product / User Document)
```

---

## 💳 Checkout & Payment System

- **Cash on Delivery (COD)**: Instantly creates order in MongoDB with `paymentStatus: 'PENDING'`.
- **Razorpay Test Payment**:
  1. Frontend calls `POST /api/payment/create-order` with total order amount.
  2. Backend initializes Razorpay Order via `razorpay.orders.create()`.
  3. Razorpay Checkout Modal opens on frontend.
  4. Upon successful payment, frontend sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `POST /api/payment/verify`.
  5. Backend verifies HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`.
  6. Order created with `paymentStatus: 'COMPLETED'`.

---

## ⚙️ Environment Variables Configuration

Create a `.env` file in the `backend/` directory:

```ini
# Server Port Configuration
PORT=5000

# Database Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blinkit_db?retryWrites=true&w=majority

# JWT Token Secret & Expiry
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Brevo Email HTTP API Configuration (for Password Reset OTP)
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_sender_email@example.com
BREVO_SENDER_NAME=BlinkitClone

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Test Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Create a `.env` file in the `frontend/` directory:

```ini
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 🚀 Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas URI or local instance

### Step 1: Clone Repository
```bash
git clone https://github.com/virendrasahu/BlinkIt-Clone-Full-Stack-Ecommerce-main.git
cd BlinkIt-Clone-Full-Stack-Ecommerce-main
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install --legacy-peer-deps
```

---

## 🌱 Database Seeding

Populate the database with sample grocery categories and products:

```bash
cd backend
npm run seed
```

---

## 🔑 1-Click Hiring Demo Accounts

For quick evaluation during hiring/code review:

- 👤 **Customer Demo Account**:
  - **Email**: `john@example.com`
  - **Password**: `Password123`

- 👑 **Admin Demo Account**:
  - **Email**: ``
  - **Password**: ``

---

## 🧪 Testing Guide

1. **Auth & Redirection**: Sign up a new account, verify automatic redirection to `/login` with success banner.
2. **5-Minute Reset OTP**: Click "Forgot Password?", enter email, check OTP, and reset password.
3. **Location Selector**: Click Location in Header, click "Detect My Location", allow browser GPS, verify marker placement and Nominatim reverse-geocoding address.
4. **Cart & Wishlist**: Add products to cart, toggle wishlist hearts, verify persistent state.
5. **Checkout**: Place order using Cash on Delivery or Razorpay Test Mode.
6. **Order Tracking**: Go to `/orders`, view order progress timeline, test 1-click Reorder button.
7. **Admin Control Suite**: Log in as `admin@example.com`, navigate to `/admin`, test product/category creation with image file upload, update order status, and manage users.

---

## 🌐 Deployment Instructions

### Backend (Render / Railway / Vercel Serverless)
1. Push backend code to GitHub.
2. Set Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `RAZORPAY_*`, `EMAIL_*`) in hosting platform dashboard.
3. Build Command: `npm install` | Start Command: `npm start`.

### Frontend (Vercel / Netlify)
1. Set Build Command: `npm run build` | Output Directory: `dist`.
2. Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`.

---

## 🛡️ Security Practices

- **Password Hashing**: Passwords stored using `bcryptjs` with 10 salt rounds.
- **JWT Protection**: Protected routes require valid `Authorization: Bearer <token>` header.
- **Role Verification**: Admin routes guarded by `adminOnly` checking `req.user.role === 'admin'`.
- **Self-Action Guards**: Admins cannot deactivate, demote, or delete their own logged-in account.
- **HTTP Headers Security**: Helmet middleware applied for secure HTTP headers.
- **Input Sanitization & CORS**: Strict CORS policy and Mongoose schema type validation.

---

## 📄 Educational Disclaimer

This project (**BlinkitMart**) is an educational clone developed for software engineering learning, technical assignment evaluation, and portfolio demonstration purposes. All product trademarks, logos, and brand names belong to their respective owners (Blinkit / Grofers).
