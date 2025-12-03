# TripVerse Frontend

A modern Next.js application for travel services including hotel bookings, car rentals, monument recognition, and weather forecasting.

## 🏗️ Project Structure

```
Frontend/
├── package.json                 # Dependencies and scripts
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.js           # PostCSS configuration
├── middleware.ts               # Route protection middleware
├── public/                     # Static assets
│   ├── icons/                  # App icons
│   └── images/                 # Images
└── src/
    ├── app/                    # App Router pages
    │   ├── layout.tsx          # Root layout
    │   ├── page.tsx            # Home page
    │   ├── globals.css         # Global styles
    │   ├── (auth)/             # Authentication routes
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   ├── (client)/           # Client routes
    │   │   ├── hotels/         # Hotel search and booking
    │   │   ├── cars/           # Car rental
    │   │   ├── bookings/       # User bookings
    │   │   ├── monuments/      # Monument recognition
    │   │   ├── weather/        # Weather forecast
    │   │   └── dashboard/      # Client dashboard
    │   ├── (driver)/           # Driver routes
    │   │   ├── dashboard/      # Driver dashboard
    │   │   ├── cars/           # Manage cars
    │   │   ├── bookings/       # Driver bookings
    │   │   └── payouts/        # Earnings
    │   ├── (admin)/            # Admin routes
    │   │   ├── dashboard/      # Admin dashboard
    │   │   ├── drivers/        # Driver verification
    │   │   ├── payments/       # Payment management
    │   │   └── disputes/       # Dispute resolution
    │   └── api/                # API routes
    ├── components/             # React components
    │   ├── ui/                 # Design system components
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx
    │   │   └── index.ts
    │   ├── shared/             # Shared components
    │   │   └── Header.tsx
    │   ├── hotels/             # Hotel-specific components
    │   │   └── HotelCard.tsx
    │   ├── cars/               # Car-specific components
    │   │   └── CarCard.tsx
    │   ├── bookings/           # Booking components
    │   ├── monuments/          # Monument components
    │   └── charts/             # Chart components
    ├── features/               # Feature-specific logic
    │   ├── auth/               # Authentication
    │   │   ├── AuthProvider.tsx
    │   │   └── useAuth.ts
    │   ├── hotels/             # Hotel features
    │   │   └── useHotelSearch.ts
    │   ├── cars/               # Car features
    │   │   └── useCarSearch.ts
    │   ├── bookings/           # Booking features
    │   │   ├── useHotelBooking.ts
    │   │   └── useCarBooking.ts
    │   ├── payments/           # Payment features
    │   ├── monuments/          # Monument features
    │   ├── weather/            # Weather features
    │   ├── drivers/            # Driver features
    │   └── admin/              # Admin features
    ├── lib/                    # Utilities and configurations
    │   ├── api/                # API client
    │   │   ├── http.ts         # HTTP client wrapper
    │   │   ├── endpoints.ts    # API endpoints
    │   │   ├── auth.api.ts     # Auth API
    │   │   ├── hotels.api.ts   # Hotels API
    │   │   ├── cars.api.ts     # Cars API
    │   │   ├── hotelBookings.api.ts
    │   │   ├── carBookings.api.ts
    │   │   ├── payments.api.ts
    │   │   ├── monuments.api.ts
    │   │   ├── weather.api.ts
    │   │   └── admin.api.ts
    │   ├── utils/              # Utility functions
    │   │   ├── index.ts        # General utilities
    │   │   ├── dates.ts        # Date utilities
    │   │   ├── currency.ts     # Currency utilities
    │   │   └── form.ts         # Form validation
    │   ├── constants/          # Application constants
    │   │   ├── roles.ts        # User roles and permissions
    │   │   ├── booking.ts      # Booking constants
    │   │   ├── payments.ts     # Payment constants
    │   │   ├── roomTypes.ts    # Room type constants
    │   │   └── currencies.ts   # Currency constants
    │   └── auth/               # Authentication utilities
    │       └── session.ts      # Session management
    ├── store/                  # State management
    │   ├── useSessionStore.ts  # Session state
    │   └── useSearchStore.ts   # Search filters state
    ├── providers/              # Context providers
    │   ├── QueryProvider.tsx   # React Query provider
    │   └── ThemeProvider.tsx   # Theme provider
    ├── hooks/                  # Custom hooks
    │   ├── useDebounce.ts      # Debounce hook
    │   ├── useDisclosure.ts    # Modal/Disclosure hook
    │   └── useLocalStorage.ts  # Local storage hook
    ├── types/                  # TypeScript types
    │   ├── api.d.ts           # API types
    │   └── index.d.ts         # General types
    └── styles/                 # Styles
        └── tailwind.css       # Tailwind utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend setup)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tripverse_frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
# Add other required environment variables
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Architecture

### Route Groups
- `(auth)` - Authentication pages (login, signup)
- `(client)` - Client-facing pages (hotels, cars, bookings)
- `(driver)` - Driver dashboard and management
- `(admin)` - Admin dashboard and management

### State Management
- **Zustand** for client state (session, search filters)
- **React Query** for server state (API data, caching)

### API Client
- Centralized HTTP client with interceptors
- Type-safe API endpoints
- Automatic token handling
- Error handling and retry logic

### Authentication
- JWT token-based authentication
- Role-based access control (RBAC)
- Route protection middleware
- Session persistence

### UI Components
- Design system with reusable components
- Tailwind CSS for styling
- Responsive design
- Dark/light theme support

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - Frontend app URL
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key

### Tailwind Configuration
Custom theme configuration with:
- Brand colors
- Typography scales
- Spacing system
- Component variants

## 📱 Features

### Client Features
- Hotel search and booking
- Car rental booking
- Monument recognition via image upload
- Weather forecast
- Booking management
- Payment processing

### Driver Features
- Car management
- Booking management
- Earnings dashboard
- Profile management

### Admin Features
- Driver verification
- Payment management
- Dispute resolution
- System analytics

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
Ensure all production environment variables are configured:
- Database connection strings
- API endpoints
- Authentication secrets
- Payment processor keys

### Deployment Platforms
- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker containers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📚 Additional Documentation

### Driver & Hotel Manager Redesign
Complete documentation for the Driver and Hotel Manager dashboard redesign:

- **[Full Documentation](./DRIVER_HOTEL_MANAGER_REDESIGN.md)** - Comprehensive guide with all changes, components, and implementation details
- **[Quick Reference](./QUICK_REFERENCE_REDESIGN.md)** - Quick lookup guide for common patterns and code snippets
- **[Changes Summary](./CHANGES_SUMMARY.md)** - Summary of all files modified and changes made

**Note**: These changes were accidentally committed to main branch. Refer to documentation for re-implementation or rollback.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team
