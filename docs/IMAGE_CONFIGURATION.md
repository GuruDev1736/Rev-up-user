# Next.js Image Configuration

## 🖼️ External Image Domains

To use images from external sources in Next.js, you need to configure allowed domains in `next.config.mjs`.

## ⚙️ Configuration

### Current Setup (`next.config.mjs`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.revupbikes.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

## 📋 Configured Domains

### 1. **Unsplash** (`images.unsplash.com`)
- Used for: Place images, demo content
- Example: `https://images.unsplash.com/photo-1577195943805-...`

### 2. **RevUp API** (`api.revupbikes.com`)
- Used for: User-uploaded images, bike images
- Example: `https://api.revupbikes.com/uploads/bikes/...`

### 3. **Cloudinary** (`**.cloudinary.com`)
- Used for: CDN-hosted images (if needed)
- Wildcard pattern allows all Cloudinary subdomains
- Example: `https://res.cloudinary.com/...`

## 🔧 How It Works

### Remote Pattern Structure
```javascript
{
  protocol: 'https',      // Only HTTPS allowed
  hostname: 'domain.com', // Exact domain or wildcard
  pathname: '/**',        // All paths allowed
}
```

### Wildcard Patterns
- `**` matches any subdomain: `**.cloudinary.com`
- `/**` matches all paths: `/photo-123/image.jpg`

## 🚀 Usage in Components

### Basic Usage
```jsx
import Image from "next/image";

<Image
  src="https://images.unsplash.com/photo-123/image.jpg"
  alt="Place"
  width={600}
  height={400}
/>
```

### With Error Handling
```jsx
const [imageSrc, setImageSrc] = useState(externalUrl);

<Image
  src={imageSrc}
  onError={() => setImageSrc(fallbackImage)}
  alt="Place"
  width={600}
  height={400}
/>
```

## ⚠️ Important Notes

### 1. **Server Restart Required**
After changing `next.config.mjs`, you must restart the dev server:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 2. **Security Considerations**
Only add trusted domains to prevent:
- Unauthorized image hosting
- Bandwidth theft
- Security vulnerabilities

### 3. **Performance**
Next.js automatically optimizes images from configured domains:
- ✅ Automatic resizing
- ✅ WebP conversion
- ✅ Lazy loading
- ✅ Blur placeholder support

## 🔒 Security Best Practices

### ✅ Do's
- Only add domains you control or trust
- Use specific hostnames when possible
- Keep the list minimal
- Regularly review configured domains

### ❌ Don'ts
- Don't use `*` to allow all domains
- Don't add untrusted user-generated content domains
- Don't configure domains without HTTPS

## 📝 Adding New Domains

### Step 1: Update Config
```javascript
// next.config.mjs
{
  protocol: 'https',
  hostname: 'newdomain.com',
  pathname: '/**',
}
```

### Step 2: Restart Server
```bash
npm run dev
```

### Step 3: Test
```jsx
<Image src="https://newdomain.com/image.jpg" ... />
```

## 🐛 Troubleshooting

### Error: "hostname not configured"
**Problem**: Domain not added to `next.config.mjs`
**Solution**: Add domain to `remotePatterns` and restart server

### Error: "Invalid src prop"
**Problem**: Image URL format incorrect or protocol mismatch
**Solution**: Verify URL starts with `https://` and domain matches config

### Images Not Loading
**Checklist**:
1. ✅ Domain in `next.config.mjs`?
2. ✅ Server restarted after config change?
3. ✅ URL format correct (https://)?
4. ✅ Image URL accessible in browser?

## 🎯 Common Use Cases

### User Profile Pictures
```javascript
{
  protocol: 'https',
  hostname: 'api.revupbikes.com',
  pathname: '/uploads/profiles/**',
}
```

### Product Images
```javascript
{
  protocol: 'https',
  hostname: 'api.revupbikes.com',
  pathname: '/uploads/bikes/**',
}
```

### Third-Party CDN
```javascript
{
  protocol: 'https',
  hostname: '**.cloudinary.com',
  pathname: '/**',
}
```

## 📊 Performance Benefits

### Automatic Optimization
- Images are automatically optimized on-demand
- Served in modern formats (WebP, AVIF)
- Cached for fast subsequent loads

### Responsive Images
- Automatically generates multiple sizes
- Serves appropriate size based on device
- Reduces bandwidth usage

### Lazy Loading
- Images load as they enter viewport
- Improves initial page load time
- Better Core Web Vitals scores

## 🔗 Related Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Image Component API](https://nextjs.org/docs/app/api-reference/components/image)
- [Remote Patterns](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns)

## ✅ Quick Reference

### Valid Configuration
```javascript
✅ hostname: 'images.unsplash.com'
✅ hostname: '**.cloudinary.com'
✅ protocol: 'https'
✅ pathname: '/**'
```

### Invalid Configuration
```javascript
❌ hostname: '*'  // Too broad
❌ protocol: 'http'  // Not secure
❌ No pathname specified
```

## 🎉 Your Setup is Ready!

Current configured domains:
- ✅ `images.unsplash.com` - For demo images
- ✅ `api.revupbikes.com` - For API images
- ✅ `**.cloudinary.com` - For CDN images

You can now use external images in your Next.js application! 🚀
