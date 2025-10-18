/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ⚠️ WARNING: Allowing all domains - not recommended for production
    // This disables Next.js image optimization security features
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Matches ALL domains
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;




// /** @type {import('next').NextConfig} */
// const nextConfig = {
// images: {
// remotePatterns: [
// {
// protocol: "https",
// hostname: "images.unsplash.com",
// pathname: "/",
// },
// {
// protocol: "https",
// hostname: "media.istockphoto.com",
// pathname: "/",
// },
// {
// protocol: "https",
// hostname: "api.revupbikes.com",
// pathname: "/",
// },
// {
// protocol: "https",
// hostname: ".cloudinary.com",
// pathname: "/**",
// },
// ],
// },
// };

// export default nextConfig;