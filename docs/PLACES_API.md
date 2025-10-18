# Places API Integration

## 📍 API Response Structure

### Get All Places
**Endpoint**: `GET /api/places/all`

**Response Format**:
```json
{
  "STS": "200",
  "MSG": "Places Fetched Successfully",
  "CONTENT": [
    {
      "id": 1,
      "placeName": "Season mall",
      "placeDescription": "This is the pune city",
      "placeImage": "https://images.unsplash.com/photo-1577195943805-...",
      "placeLocation": "At Maharashtra",
      "createdAt": 1760124937000
    }
  ]
}
```

## 🎨 Place Card Display

### Data Mapping
| API Field | Display | Component |
|-----------|---------|-----------|
| `placeName` | Card Title | `<h2>` |
| `placeLocation` | Location with 📍 icon | `<p>` |
| `placeDescription` | Description (2 lines max) | `<p>` |
| `placeImage` | Card Image | `<Image>` |
| `id` | Navigation link | `/locations/{id}` |

### Visual Features
- ✅ **Image Loading**: Fallback image on error
- ✅ **Loading State**: Animated skeleton (3 cards)
- ✅ **Error Handling**: Retry button on failure
- ✅ **Empty State**: "No places available" message
- ✅ **Responsive Grid**: 
  - Mobile: 1 column
  - Tablet: 2 columns  
  - Desktop: 3 columns

## 📦 Component Structure

### PlacesSection Component
Location: `src/components/home/PlacesSection.jsx`

```jsx
// Main component with state management
export default function PlacesSection() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch places on mount
  useEffect(() => {
    fetchPlaces();
  }, []);
}
```

### PlaceCard Component
```jsx
const PlaceCard = ({ place }) => (
  <div className="card-styles">
    <PlaceImage src={place.placeImage} />
    <h2>{place.placeName}</h2>
    <p>📍 {place.placeLocation}</p>
    <p>{place.placeDescription}</p>
    <Link href={`/locations/${place.id}`}>
      <button>Book Now</button>
    </Link>
  </div>
);
```

### PlaceImage Component
```jsx
// Smart image with error handling
const PlaceImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(src || fallbackImage);
  
  const handleError = () => {
    setImageSrc(fallbackImage); // Use fallback on error
  };
  
  return <Image src={imageSrc} onError={handleError} />;
};
```

## 🔄 Data Flow

### 1. Component Mount
```javascript
useEffect(() => {
  fetchPlaces(); // Called once on component mount
}, []);
```

### 2. API Call
```javascript
const response = await getAllPlaces();
// Calls: GET https://api.revupbikes.com/api/places/all
// With Authorization: Bearer <token>
```

### 3. Response Handling
```javascript
if (response.STS === "200" && response.CONTENT) {
  setPlaces(response.CONTENT); // Extract places array
} else {
  setError(response.MSG); // Show error message
}
```

### 4. Rendering
```javascript
return (
  <div className="grid">
    {places.map((place) => (
      <PlaceCard key={place.id} place={place} />
    ))}
  </div>
);
```

## 🎯 Features

### Card Hover Effects
```css
/* Applied via Tailwind */
shadow-xl hover:shadow-2xl transition duration-300
```

### Image Optimization
- Next.js Image component for automatic optimization
- Lazy loading (priority={false})
- Responsive sizing (width: 600, height: 400)
- Object-fit: cover for consistent aspect ratio

### Navigation
- Click "Book Now" → Navigate to `/locations/{place.id}`
- Shows available bikes for that location

### Text Truncation
```css
line-clamp-2 /* Limits description to 2 lines */
```

## 📱 Responsive Design

### Grid Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Breakpoints
- **Mobile** (< 768px): 1 column
- **Tablet** (768px - 1024px): 2 columns
- **Desktop** (> 1024px): 3 columns

## 🛠️ Error Handling

### Loading State
```jsx
if (loading) {
  return <LoadingSkeleton />;
}
```

### Error State
```jsx
if (error) {
  return (
    <div>
      <p>Error: {error}</p>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}
```

### Empty State
```jsx
if (places.length === 0) {
  return <p>No places available at the moment.</p>;
}
```

### Image Error
```jsx
<Image
  src={place.placeImage}
  onError={() => setImageSrc(fallbackImage)}
/>
```

## 🔗 Integration Points

### Home Page
```jsx
// src/app/page.js
import HeroSection from "@/components/home/HeroSection";

// HeroSection.jsx includes PlacesSection
<section>
  <h2>Explore Our Locations</h2>
  <PlacesSection />
</section>
```

### Location Details Page
```jsx
// src/app/locations/[location]/page.jsx
export default function LocationPage({ params }) {
  const locationId = params.location; // Matches place.id
  // Show bikes available at this location
}
```

## 📊 API Integration

### Service Layer
```javascript
// src/api/places.js
import { apiGet } from "@/lib/apiClient";

export const getAllPlaces = async () => {
  return await apiGet("/api/places/all");
  // Token automatically included by apiClient
};
```

### Usage in Component
```javascript
import { getAllPlaces } from "@/api/places";

const response = await getAllPlaces();
// Returns: { STS, MSG, CONTENT }
```

## 🎨 Styling

### Card Styles
- Background: White
- Border Radius: 2xl (rounded-2xl)
- Padding: 1.5rem (p-6)
- Shadow: Extra Large on hover
- Transition: 300ms

### Image Styles
- Border Radius: xl (rounded-xl)
- Object Fit: cover
- Height: 12rem (h-48)
- Width: 100% (w-full)

### Typography
- Title: 2xl, font-semibold
- Location: sm, text-gray-500
- Description: sm, text-gray-600
- Button: Black bg, white text, rounded-full

## 🚀 Performance

### Optimization
- ✅ Next.js Image optimization
- ✅ Lazy loading images
- ✅ Efficient state management
- ✅ Single API call on mount
- ✅ Memoized card components

### Loading States
- ✅ Skeleton screens during fetch
- ✅ Progressive image loading
- ✅ Smooth transitions

## 🧪 Testing

### Test Scenarios
1. ✅ Successful data load
2. ✅ Empty response handling
3. ✅ Network error handling
4. ✅ Image load failure
5. ✅ Navigation on button click
6. ✅ Responsive layout

### Example Test
```javascript
// Check if places render correctly
expect(screen.getByText("Season mall")).toBeInTheDocument();
expect(screen.getByText("At Maharashtra")).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Book Now/i })).toBeInTheDocument();
```

## 📝 Usage Example

```jsx
// Display places on home page
import PlacesSection from "@/components/home/PlacesSection";

export default function HomePage() {
  return (
    <div>
      <section>
        <h1>Explore Our Locations</h1>
        <p>Discover amazing places...</p>
        <PlacesSection />
      </section>
    </div>
  );
}
```

## 🔧 Customization

### Add More Fields
```jsx
// Add rating display
{place.rating && (
  <p>⭐ {place.rating}/5</p>
)}
```

### Custom Navigation
```jsx
// Open in new tab
<Link href={`/locations/${place.id}`} target="_blank">
```

### Filter Places
```jsx
// Add filtering
const filteredPlaces = places.filter(place => 
  place.placeLocation.includes(searchTerm)
);
```

This component is fully functional and ready to display places from your API! 🎉
