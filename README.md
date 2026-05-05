# E-Commerce Frontend

A production-ready React frontend for the e-commerce backend application.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for routing
- **Axios** with interceptors for API calls
- **React Query** for data fetching and caching
- **Zod** for form validation
- **React Hook Form** for form management
- **React Hot Toast** for notifications

## Features

### User Features
- ✅ User authentication (login, signup, password reset)
- ✅ Product browsing and search
- ✅ Product details page
- ✅ Shopping cart management
- ✅ Checkout flow with multiple payment methods
- ✅ Order history (placeholder - needs backend endpoint)
- ✅ User profile management
- ✅ Wishlist functionality

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ Product management (CRUD)
- ✅ Order management (placeholder - needs GraphQL/REST endpoint)
- ✅ User management (placeholder - needs backend endpoint)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── admin/         # Admin-specific components
│   ├── auth/          # Authentication components
│   └── layout/        # Layout components
├── contexts/          # React contexts (Auth)
├── layouts/           # Page layouts (UserLayout, AdminLayout)
├── lib/               # Utilities and API clients
│   ├── api/          # API service functions
│   └── utils.ts      # Helper functions
├── pages/             # Page components
│   ├── admin/        # Admin pages
│   ├── auth/         # Auth pages
│   └── user/         # User pages
├── types/             # TypeScript type definitions
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## API Integration

The frontend integrates with the backend API endpoints:

- **Auth**: `/auth/*` - Authentication endpoints
- **Products**: `/product/*` - Product CRUD operations
- **Cart**: `/cart` - Shopping cart management
- **Orders**: `/order/*` - Order creation and checkout
- **Dashboard**: `/dashboard/*` - Admin statistics
- **User**: `/user/*` - User profile and settings

## Environment Variables

- `VITE_API_URL`: Backend API base URL (default: http://localhost:3000)

## Notes

Some features require additional backend endpoints:

1. **Order History**: Currently a placeholder. Requires:
   - GraphQL query `AllOrders` (for admin)
   - REST endpoint `GET /order/user/orders` (for users)

2. **User Management**: Requires:
   - `GET /user/admin/users` endpoint

3. **Order Management**: Requires:
   - GraphQL query or REST endpoint for listing all orders

## Authentication Flow

1. User logs in → receives `access_token` and `refresh_token`
2. Tokens stored in `localStorage`
3. Axios interceptor adds `Bearer` token to requests
4. On 401, attempts token refresh
5. On refresh failure, redirects to login

## Payment Integration

The checkout flow supports multiple payment methods:
- PayPal
- Card (PayMob iframe)
- Cash
- Fawry
- Vodafone

Payment redirects are handled based on the payment method selected.

## Contributing

1. Follow TypeScript best practices
2. Use React Query for all data fetching
3. Validate forms with Zod
4. Use Tailwind CSS for styling
5. Follow the existing component structure

## License

Private - All rights reserved
