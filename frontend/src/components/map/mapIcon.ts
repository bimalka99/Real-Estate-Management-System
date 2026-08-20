import L from "leaflet";

// A simple gold teardrop pin as inline SVG, matching the site's accent color —
// avoids Leaflet's default marker image paths, which don't resolve correctly
// through Next.js's bundler without extra webpack config.
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
  <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26c0-8.837-7.163-16-16-16z" fill="#B4924C"/>
  <circle cx="16" cy="16" r="6" fill="#17160F"/>
</svg>`;

export const goldPinIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PIN_SVG)}`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
});
