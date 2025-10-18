# Project Structure

This document describes the reorganized folder structure of the Rev-up-user project.

## 📁 Directory Structure

```
src/
├── api/                      # API service layer (lowercase, .js files)
│   ├── auth.js              # Authentication APIs (login, register)
│   ├── bikes.js             # Bike-related APIs
│   └── places.js            # Places-related APIs
│
├── app/                      # Next.js App Router pages
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   ├── images/              # Static images used in pages
│   ├── locations/           # Dynamic location pages
│   │   └── [location]/      # Dynamic route for specific locations
│   ├── login/               # Login page
│   ├── privacypolicy/       # Privacy policy page
│   ├── refund-policy/       # Refund policy page
│   ├── register/            # Registration page
│   ├── terms-condition/     # Terms and conditions page
│   ├── favicon.ico          # Site favicon
│   ├── globals.css          # Global styles
│   ├── layout.js            # Root layout component
│   └── page.js              # Home page
│
├── components/               # React components organized by feature
│   ├── auth/                # Authentication-related components
│   │   └── AuthGuard.jsx    # Route protection component
│   │
│   ├── bikes/               # Bike-related components
│   │   ├── BikeCarousel.jsx # Bike carousel slider
│   │   └── BikeList.jsx     # Bike listing component
│   │
│   ├── common/              # Reusable common components
│   │   ├── Container.jsx    # Layout container
│   │   ├── Footer.jsx       # Site footer
│   │   ├── Header.jsx       # Site header
│   │   └── Navbar.jsx       # Navigation bar
│   │
│   └── home/                # Home page specific components
│       ├── Accordian.jsx    # Accordion component
│       ├── HeroSection.jsx  # Hero banner section
│       ├── ImageHover.jsx   # Image hover effect component
│       └── PlacesSection.jsx # Places display section
│
├── contexts/                 # React Context providers
│   └── AuthContext.jsx      # Authentication context and provider
│
├── lib/                      # Utility functions and configurations
│   └── apiClient.js         # Centralized API client with auth handling
│
└── styles/                   # CSS modules
    ├── home/
    │   └── home.module.css
    ├── footer.module.css
    └── header.module.css
```

## 🎯 Naming Conventions

- **API Files**: Lowercase with `.js` extension (e.g., `auth.js`, `bikes.js`)
  - No JSX content, pure JavaScript functions
  - Named exports for clarity
  
- **Components**: PascalCase with `.jsx` extension (e.g., `Header.jsx`, `BikeList.jsx`)
  - Contains JSX/React components
  - Default exports for main components
  
- **Folders**: 
  - `api/` - lowercase for consistency
  - Feature-based organization (`auth/`, `bikes/`, `home/`)
  - `common/` for shared/reusable components

## 📦 Import Paths

### Absolute Imports (using `@/` alias)
```javascript
// API imports
import { loginUser } from "@/api/auth";
import { getAllPlaces } from "@/api/places";
import { getBikeByPlaceId } from "@/api/bikes";

// Common components
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Container from "@/components/common/Container";
import Navbar from "@/components/common/Navbar";

// Feature components
import AuthGuard from "@/components/auth/AuthGuard";
import BikeList from "@/components/bikes/BikeList";
import BikeCarousel from "@/components/bikes/BikeCarousel";

// Contexts
import { useAuth } from "@/contexts/AuthContext";

// Utilities
import { apiGet, apiPost } from "@/lib/apiClient";

// Images
import banner from "@/app/images/homepage-banner.avif";
```

### Relative Imports (within same directory)
```javascript
// In Header.jsx
import Container from "./Container";
import Navbar from "./Navbar";

// In HeroSection.jsx
import Accordian from "./Accordian";
import PlacesSection from "./PlacesSection";
```

## 🔧 API Client Usage

All API calls use the centralized `apiClient.js` which automatically handles:
- Authentication tokens (except login/register)
- Error handling
- Token expiry management

```javascript
// Authenticated API calls
import { apiGet, apiPost } from "@/lib/apiClient";

// Non-authenticated (login/register)
import { apiPostNoAuth } from "@/lib/apiClient";
```

## 📝 File Organization Rules

1. **Component Files**: Group by feature, not by type
   - ✅ `components/auth/AuthGuard.jsx`
   - ❌ `components/guards/AuthGuard.jsx`

2. **API Files**: Mirror backend API structure
   - ✅ `api/auth.js` for authentication endpoints
   - ✅ `api/bikes.js` for bike-related endpoints

3. **Common Components**: Only truly reusable components
   - Header, Footer, Container, Navbar
   - Not feature-specific

4. **Page Components**: Keep in `app/` directory following Next.js conventions
   - Use folder structure for routes
   - Each route has its own `page.jsx`

## 🚀 Benefits of This Structure

1. **Clear Separation of Concerns**: API, components, pages, and utilities are clearly separated
2. **Easy Navigation**: Developers can quickly find what they need
3. **Scalability**: Easy to add new features without cluttering
4. **Consistency**: Standard naming and organization patterns
5. **Maintainability**: Related files are grouped together
6. **Type Safety**: `.js` for pure JS, `.jsx` for React components

## 🔄 Migration Notes

- Old `Api/` → New `api/`
- Old `utils/` → New `lib/`
- Flat `components/` → Organized `components/[feature]/`
- All imports updated to use new structure
