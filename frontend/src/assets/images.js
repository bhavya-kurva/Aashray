// Centralized High-Resolution Photographic Nature & Disaster Static Assets Catalog
// Explicit static imports for Vite bundling and local development
import floodImg from './flood.jpg';
import cycloneImg from './cyclone.jpg';
import landslideImg from './landslide.jpg';
import wildfireImg from './wildfire.jpg';
import heroImg from './hero.jpg';
import rescueImg from './rescue.jpg';
import shelterImg from './shelter.jpg';
import coastlineImg from './coastline.jpg';
import radarImg from './radar.svg';
import aiAvatarImg from './ai-avatar.svg';

export const IMAGES = {
  hero: heroImg,
  cyclone: cycloneImg,
  flood: floodImg,
  landslide: landslideImg,
  fire: wildfireImg,
  rescue: rescueImg,
  shelter: shelterImg,
  coastline: coastlineImg,
  radar: radarImg,
  aiAvatar: aiAvatarImg,
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
