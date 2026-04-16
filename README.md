# PharmaCare - Cpmmunity Pharmacies Online Ordering Platform

## Module: QH0640 CWA 

### How to Run

1. Install dependencies:
npm install

2. Create `.env.local` in the project root with your Firebase config (already included).

3. Start the development server:
npm run dev -- -p 3001

4. open [http://localhost:3001](http://localhost:3001)

## Credentials

# Amin Account 
// Email: admin@pharmacy.com
//Password: andreea
// Access: Amin dashboard, manage inventory, view all orders

# User Account 
// Email: user@pharmacy.com
//Password: lavinia
// Access: Browse pharmacies, order products, view own orders

## Tech Stack
// Framework : Next.js  App router 
// Database : Firebase Firestore
// Authentication: Firebase Auth
// Mapping: Leaflet - vanilla
// Styling: Tailwinf CSS + shadcn/ui components
// Language: JavaScript/JSX

## App features

// Search products by name and category, filter pharmacy by location
// Order products with real-time stock reduction
// User authenticationwith admin/user roles
// Admin: add new prodcuts to pharmacy inventory
// Admin: view all pharmacies, stock level and order in real-time
// User: view current and past orders with full details
// User: cancel orders with automatic srock restoration
// Admin: edit stock quantiies and remove products from inventory
// Interactive Leaflet map wth pharmacy markers and product ordering from popups

////app/
## page.jsx   - Home page( React Server Component)
## login/page.jsx. - Login page 
## register/page.jsx. - Reister page
##  pharmacies/page.jsx   - Pharmacies list + map (React Server Component)
## [id]/page.jsx  - Pharmacy details (React Server Component)
## products/page.jsx  -  Products browse + search (RSC)
## orders/ page.jsx   - My orders list
## [id]/page.jsx     -  Order details + cancel
## admin/page.jsx    - Admin dashboard

///components/
## Header.jsx   -   Navigation header
## Cart.jsx     -   Shopping cart
## CartDrawer.jsx   -  Cart slide-out drawer
## PharmacyMap.jsx  -    Leaflet map component

////lib/
## firebase.js     -  Firebase initialisation
## authContext.jsx   -  Auth context + useAuth hook
## cartContext.jsx   -  Cart context + useCart hook

