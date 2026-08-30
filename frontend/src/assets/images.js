// Centralized High-Resolution Nature & Disaster SVG Data Catalog
// 100% Offline, Self-Contained, zero external network dependency & zero API key requirements

const makeSvgDataUri = (startColor, endColor, title, iconPath) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${startColor}" />
        <stop offset="100%" stop-color="${endColor}" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)" />
    <rect width="1200" height="800" fill="url(#grid)" />
    <circle cx="600" cy="400" r="300" fill="rgba(255,255,255,0.03)" />
    <g transform="translate(600, 360)">
      <path d="${iconPath}" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(-48, -70) scale(4)" />
      <text y="140" fill="#ffffff" fill-opacity="0.95" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" text-anchor="middle" letter-spacing="3">${title}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const IMAGES = {
  hero: makeSvgDataUri("#0f172a", "#1e1b4b", "MONSOON STORM SURGE MONITOR", "M 12 3 v 18 M 3 12 h 18"),
  cyclone: makeSvgDataUri("#1e1b4b", "#311042", "TROPICAL CYCLONE ADVISORY", "M 12 2 a 10 10 0 1 0 10 10"),
  flood: makeSvgDataUri("#0c4a6e", "#0369a1", "FLASH FLOOD EMERGENCY ZONE", "M 2 12 Q 6 8 10 12 T 18 12 T 26 12"),
  landslide: makeSvgDataUri("#451a03", "#78350f", "HILL SLOPE LANDSLIDE RISK", "M 3 20 L 12 4 L 21 20 Z"),
  fire: makeSvgDataUri("#7c2d12", "#991b1b", "WILDFIRE CONTROL CORRIDOR", "M 12 2 c 0 0 -4 4 -4 8 a 4 4 0 0 0 8 0 c 0 -4 -4 -8 -4 -8 Z"),
  rescue: makeSvgDataUri("#064e3b", "#047857", "HUMANITARIAN RESCUE CORPS", "M 12 21 s -6 -4 -6 -10 a 6 6 0 0 1 12 0 c 0 6 -6 10 -6 10 Z"),
  shelter: makeSvgDataUri("#14532d", "#15803d", "SAFE RELIEF SHELTER CAMP", "M 3 9 l 9 -7 l 9 7 v 11 a 2 2 0 0 1 -2 2 H 5 a 2 2 0 0 1 -2 -2 Z"),
  coastline: makeSvgDataUri("#0f172a", "#0f766e", "INDIAN OCEAN COASTAL BELT", "M 2 12 Q 6 16 10 12 T 18 12 T 26 12"),
  radar: makeSvgDataUri("#1e1b4b", "#1e293b", "IMD SATELLITE RADAR FEED", "M 12 2 a 10 10 0 1 0 10 10"),
  aiAvatar: makeSvgDataUri("#312e81", "#1e1b4b", "AASHRAY AI NODE", "M 12 2 v 20 M 2 12 h 20"),
};

export const DISASTER_TYPES = [
  {
    id: "flood",
    name: "Flood Emergency",
    title: "Flash Flood & Overflow",
    image: IMAGES.flood,
    description: "Coastal surge, river breaching, and urban flooding alerts in low-lying zones.",
    color: "from-blue-600 to-cyan-700",
    badge: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  },
  {
    id: "cyclone",
    name: "Cyclone Advisory",
    title: "Tropical Cyclone Warning",
    image: IMAGES.cyclone,
    description: "High velocity sea gales and heavy rainfall landfall warnings.",
    color: "from-indigo-600 to-purple-800",
    badge: "bg-purple-500/20 text-purple-300 border-purple-400/30",
  },
  {
    id: "landslide",
    name: "Landslide Risk",
    title: "Hill Slope Collapse",
    image: IMAGES.landslide,
    description: "Unstable terrain warnings along steep mountainous corridors.",
    color: "from-amber-600 to-yellow-800",
    badge: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  },
  {
    id: "fire",
    name: "Wildfire Alert",
    title: "Forest & Habitat Fire",
    image: IMAGES.fire,
    description: "Rapid spreading timber and brush fires threatening nearby settlements.",
    color: "from-red-600 to-orange-700",
    badge: "bg-red-500/20 text-red-300 border-red-400/30",
  },
];
