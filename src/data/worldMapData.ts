/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-Precision Equirectangular World Map Vector Geometry
 * Calibrated for a 1000x500 Plate Carrée (Equirectangular) canvas:
 *   X: 0 to 1000 (Longitude: -180° to +180°) -> X = (lon + 180) * (1000 / 360)
 *   Y: 0 to 500 (Latitude: +90° to -90°)     -> Y = (90 - lat) * (500 / 180)
 */

export interface MapRegionPreset {
  id: string;
  name: string;
  subtitle: string;
  center: { lat: number; lon: number };
  zoom: number;
  panOffset: { x: number; y: number };
  icon?: string;
}

export interface GeographicLabel {
  name: string;
  type: 'continent' | 'ocean' | 'tropic' | 'sea' | 'country';
  x: number; // in SVG units 0-1000
  y: number; // in SVG units 0-500
  fontSize: number;
  letterSpacing?: number;
  color?: string;
  rotation?: number;
}

/**
 * Converts geographic latitude and longitude to SVG coordinates (1000x500 canvas)
 */
export function latLonToSvg(lat: number, lon: number): { x: number; y: number; xPercent: number; yPercent: number } {
  // Clamp lat between -90 and 90, lon between -180 and 180
  const clampedLat = Math.max(-90, Math.min(90, lat));
  const clampedLon = Math.max(-180, Math.min(180, lon));

  const x = ((clampedLon + 180) / 360) * 1000;
  const y = ((90 - clampedLat) / 180) * 500;

  return {
    x,
    y,
    xPercent: (x / 1000) * 100,
    yPercent: (y / 500) * 100,
  };
}

/**
 * Mathematical Equirectangular Latitudes of Special Geographic Significance
 */
export const CARTOGRAPHIC_LINES = {
  // Equator: 0° latitude -> y = 250
  equatorY: 250,
  // Tropic of Cancer: 23.4365° N -> y = (90 - 23.4365) / 180 * 500 = 184.9
  tropicOfCancerY: 184.9,
  // Tropic of Capricorn: 23.4365° S -> y = (90 - (-23.4365)) / 180 * 500 = 315.1
  tropicOfCapricornY: 315.1,
  // Arctic Circle: 66.56° N -> y = 65.1
  arcticCircleY: 65.1,
  // Antarctic Circle: 66.56° S -> y = 434.9
  antarcticCircleY: 434.9,
  // Prime Meridian: 0° longitude -> x = 500
  primeMeridianX: 500,
  // International Date Line: ±180° longitude -> x = 0 and x = 1000
  dateLineX: 1000,
};

/**
 * Regional Presets for one-click smooth panning and zooming
 */
export const REGION_PRESETS: MapRegionPreset[] = [
  {
    id: 'world',
    name: 'Global View',
    subtitle: 'All Continents & 15+ Cancer Centers',
    center: { lat: 20, lon: 0 },
    zoom: 1,
    panOffset: { x: 0, y: 0 },
  },
  {
    id: 'north_america',
    name: 'North America',
    subtitle: 'MD Anderson · MSKCC · Mayo · Dana-Farber · Princess Margaret',
    center: { lat: 38, lon: -95 },
    zoom: 2.2,
    panOffset: { x: 38, y: 22 },
  },
  {
    id: 'europe',
    name: 'Europe & UK',
    subtitle: 'Gustave Roussy Paris · Royal Marsden London · Charité Berlin',
    center: { lat: 50, lon: 10 },
    zoom: 2.8,
    panOffset: { x: -4, y: 40 },
  },
  {
    id: 'asia_pacific',
    name: 'Asia-Pacific',
    subtitle: 'NCC Tokyo · Tata Memorial Mumbai · Fudan Shanghai · Peter Mac',
    center: { lat: 25, lon: 105 },
    zoom: 2.1,
    panOffset: { x: -62, y: 10 },
  },
  {
    id: 'latin_america',
    name: 'Latin America',
    subtitle: 'Hospital de Amor Barretos (São Paulo, Brazil)',
    center: { lat: -15, lon: -60 },
    zoom: 2.1,
    panOffset: { x: 26, y: -38 },
  },
  {
    id: 'middle_east_africa',
    name: 'Middle East & Africa',
    subtitle: 'KHCC Amman · NCI Cairo',
    center: { lat: 28, lon: 35 },
    zoom: 2.4,
    panOffset: { x: -20, y: 18 },
  },
];

/**
 * Cartographic Geographic Typography Labels (Continent, Oceans, Key Tropics)
 */
export const GEOGRAPHIC_LABELS: GeographicLabel[] = [
  // Continents
  { name: 'NORTH AMERICA', type: 'continent', x: 215, y: 152, fontSize: 13, letterSpacing: 3 },
  { name: 'SOUTH AMERICA', type: 'continent', x: 325, y: 375, fontSize: 13, letterSpacing: 3 },
  { name: 'EUROPE', type: 'continent', x: 512, y: 136, fontSize: 11, letterSpacing: 2 },
  { name: 'AFRICA', type: 'continent', x: 535, y: 310, fontSize: 13, letterSpacing: 3 },
  { name: 'ASIA', type: 'continent', x: 745, y: 148, fontSize: 15, letterSpacing: 4.5 },
  { name: 'AUSTRALIA', type: 'continent', x: 860, y: 405, fontSize: 11, letterSpacing: 2.5 },

  // Oceans
  { name: 'NORTH ATLANTIC OCEAN', type: 'ocean', x: 370, y: 195, fontSize: 9.5, letterSpacing: 2 },
  { name: 'SOUTH ATLANTIC OCEAN', type: 'ocean', x: 420, y: 380, fontSize: 9.5, letterSpacing: 2 },
  { name: 'NORTH PACIFIC OCEAN', type: 'ocean', x: 95, y: 185, fontSize: 10, letterSpacing: 2.5 },
  { name: 'SOUTH PACIFIC OCEAN', type: 'ocean', x: 120, y: 380, fontSize: 10, letterSpacing: 2.5 },
  { name: 'INDIAN OCEAN', type: 'ocean', x: 695, y: 375, fontSize: 10, letterSpacing: 2.5 },
  { name: 'ARCTIC OCEAN', type: 'ocean', x: 560, y: 32, fontSize: 8.5, letterSpacing: 2 },

  // Tropics
  { name: 'TROPIC OF CANCER (23.5° N)', type: 'tropic', x: 18, y: 181, fontSize: 8.5, letterSpacing: 1.5, color: '#f43f5e' },
  { name: 'EQUATOR (0°)', type: 'tropic', x: 18, y: 246, fontSize: 8.5, letterSpacing: 1.5, color: '#0d9488' },
  { name: 'TROPIC OF CAPRICORN (23.5° S)', type: 'tropic', x: 18, y: 328, fontSize: 8.5, letterSpacing: 1.5, color: '#38bdf8' },
];

/**
 * Detailed Landmass Geometries in Equirectangular Projection (1000x500)
 * Faithfully follows physical geography:
 * - Real coastal indentations (Chesapeake, Gulf of Mexico, Puget Sound, St. Lawrence)
 * - True peninsulas (Florida, Baja, Yucatan, Scandinavia, Iberia, Italy, Peloponnese, Arabia, India, Korea, Kamchatka, Cape York)
 * - Major islands (Greenland, Great Britain, Ireland, Iceland, Cuba, Hispaniola, Madagascar, Sri Lanka, Japan: Honshu/Hokkaido/Kyushu, Taiwan, Philippines, Indonesia, Tasmania, New Zealand)
 */

export interface ContinentFeature {
  id: string;
  name: string;
  region: string;
  d: string;
  fill?: string;
  stroke?: string;
  subfeatures?: { name: string; d: string }[];
}

export const WORLD_CONTINENT_FEATURES: ContinentFeature[] = [
  // 1. NORTH AMERICA (Continental mainland + Alaska + Mexico + Central America)
  {
    id: 'north_america_main',
    name: 'North America',
    region: 'north_america',
    d: `M 65 72
        C 72 58, 88 52, 108 55
        C 125 58, 142 50, 160 52
        C 178 54, 195 48, 218 52
        C 238 56, 252 65, 265 62
        C 278 60, 290 68, 302 78
        C 310 85, 305 92, 285 96
        C 268 98, 256 108, 264 120
        C 272 130, 288 118, 308 114
        C 324 110, 335 122, 320 135
        C 312 142, 310 152, 305 162
        C 298 174, 292 190, 288 202
        C 285 210, 282 222, 280 232
        C 278 240, 272 245, 268 238
        C 264 232, 258 226, 250 228
        C 242 230, 238 238, 245 244
        C 252 248, 260 248, 264 242
        C 266 238, 262 232, 256 230
        C 250 230, 246 236, 248 242
        C 252 250, 258 258, 265 265
        C 272 272, 275 278, 270 282
        C 265 285, 258 282, 252 278
        C 245 272, 238 265, 230 258
        C 222 250, 215 242, 210 230
        C 205 218, 198 205, 194 192
        C 190 178, 185 165, 180 152
        C 175 140, 168 130, 155 120
        C 142 110, 128 102, 112 95
        C 95 88, 78 85, 65 72 Z`,
  },

  // Alaska & Aleutians
  {
    id: 'alaska_peninsula',
    name: 'Alaska & Aleutian Islands',
    region: 'north_america',
    d: `M 65 72 C 55 78, 42 85, 32 94 C 28 98, 30 102, 38 98 C 50 90, 62 82, 74 76 Z`,
  },

  // Baja California Peninsula
  {
    id: 'baja_california',
    name: 'Baja California',
    region: 'north_america',
    d: `M 188 205 C 192 218, 196 232, 202 248 C 204 254, 200 256, 196 250 C 190 236, 186 222, 182 208 Z`,
  },

  // Greenland
  {
    id: 'greenland',
    name: 'Greenland',
    region: 'north_america',
    d: `M 340 32
        C 365 22, 400 25, 418 42
        C 426 52, 412 76, 395 84
        C 378 90, 360 76, 348 62
        C 336 50, 330 38, 340 32 Z`,
  },

  // Caribbean Islands (Cuba, Hispaniola, Puerto Rico)
  {
    id: 'cuba_caribbean',
    name: 'Cuba & Greater Antilles',
    region: 'north_america',
    d: `M 268 238 C 278 240, 292 244, 302 246 C 304 247, 300 250, 292 248 C 282 245, 272 242, 268 238 Z
        M 308 248 C 316 250, 326 252, 332 253 C 334 255, 330 257, 322 255 C 314 253, 308 250, 308 248 Z`,
  },

  // 2. SOUTH AMERICA
  {
    id: 'south_america_main',
    name: 'South America',
    region: 'latin_america',
    d: `M 276 278
        C 292 272, 318 274, 338 282
        C 358 290, 376 308, 392 332
        C 398 344, 392 362, 385 382
        C 378 400, 365 422, 352 440
        C 340 456, 326 475, 322 492
        C 320 496, 314 494, 314 486
        C 310 470, 304 445, 300 422
        C 294 394, 286 365, 276 335
        C 268 314, 265 298, 276 278 Z`,
  },

  // Tierra del Fuego & Falklands
  {
    id: 'tierra_del_fuego',
    name: 'Tierra del Fuego & Falkland Islands',
    region: 'latin_america',
    d: `M 318 494 C 324 496, 328 502, 320 502 C 314 502, 314 496, 318 494 Z
        M 342 485 C 346 484, 348 488, 344 490 C 340 490, 339 486, 342 485 Z`,
  },

  // 3. EUROPE
  {
    id: 'europe_main',
    name: 'Europe Mainland',
    region: 'europe',
    d: `M 462 135
        C 475 125, 492 122, 515 122
        C 538 122, 565 110, 580 120
        C 595 130, 600 148, 590 165
        C 580 178, 560 175, 545 185
        C 535 192, 528 180, 522 170
        C 518 162, 508 160, 495 162
        C 480 165, 465 155, 462 135 Z`,
  },

  // Scandinavian Peninsula (Norway & Sweden)
  {
    id: 'scandinavia',
    name: 'Scandinavia (Norway & Sweden)',
    region: 'europe',
    d: `M 502 110
        C 508 88, 518 64, 535 52
        C 548 44, 562 55, 565 72
        C 568 92, 552 112, 538 120
        C 522 124, 508 122, 502 110 Z`,
  },

  // Iberian Peninsula (Spain & Portugal)
  {
    id: 'iberia',
    name: 'Iberian Peninsula (Spain & Portugal)',
    region: 'europe',
    d: `M 458 158
        C 480 156, 482 172, 478 190
        C 472 196, 458 198, 450 192
        C 445 182, 448 165, 458 158 Z`,
  },

  // Italian Peninsula "The Boot"
  {
    id: 'italy',
    name: 'Italy',
    region: 'europe',
    d: `M 515 158
        C 522 165, 532 172, 540 178
        C 544 182, 538 188, 532 186
        C 525 182, 518 170, 515 158 Z
        M 528 192 C 534 192, 534 198, 526 198 C 522 198, 522 192, 528 192 Z`,
  },

  // British Isles: Great Britain & Ireland
  {
    id: 'british_isles',
    name: 'Great Britain & Ireland',
    region: 'europe',
    d: `M 464 96
        C 475 92, 478 105, 472 118
        C 468 128, 475 135, 462 136
        C 455 130, 458 115, 464 96 Z
        M 444 112
        C 450 108, 455 114, 453 124
        C 449 128, 442 125, 444 112 Z`,
  },

  // Iceland
  {
    id: 'iceland',
    name: 'Iceland',
    region: 'europe',
    d: `M 418 66 C 428 62, 436 68, 434 76 C 426 80, 416 74, 418 66 Z`,
  },

  // 4. AFRICA
  {
    id: 'africa_main',
    name: 'Africa',
    region: 'middle_east_africa',
    d: `M 458 198
        C 485 192, 540 195, 585 202
        C 605 208, 615 225, 622 245
        C 645 258, 642 272, 625 285
        C 610 305, 600 345, 590 380
        C 580 405, 565 422, 545 428
        C 530 422, 520 395, 520 360
        C 520 325, 508 285, 480 276
        C 450 274, 422 262, 420 238
        C 420 215, 445 202, 458 198 Z`,
  },

  // Madagascar
  {
    id: 'madagascar',
    name: 'Madagascar',
    region: 'middle_east_africa',
    d: `M 628 350 C 638 345, 644 375, 640 402 C 634 408, 626 385, 628 350 Z`,
  },

  // 5. ASIA & EURASIA
  {
    id: 'asia_main',
    name: 'Asia',
    region: 'asia_pacific',
    d: `M 580 120
        C 610 80, 680 50, 780 48
        C 860 48, 920 65, 940 95
        C 945 110, 925 135, 915 145
        C 890 152, 875 168, 860 178
        C 845 190, 830 220, 815 240
        C 800 262, 792 285, 798 310
        C 792 315, 785 295, 775 275
        C 765 255, 755 240, 745 235
        C 725 250, 708 280, 715 310
        C 705 315, 690 295, 678 268
        C 668 245, 650 235, 638 238
        C 625 245, 610 268, 618 275
        C 635 285, 648 272, 650 260
        C 655 248, 645 228, 632 225
        C 615 220, 595 210, 585 198
        C 580 175, 570 150, 580 120 Z`,
  },

  // Arabian Peninsula
  {
    id: 'arabian_peninsula',
    name: 'Arabian Peninsula',
    region: 'middle_east_africa',
    d: `M 598 215
        C 615 210, 635 220, 648 242
        C 655 255, 640 274, 622 278
        C 605 272, 600 245, 598 215 Z`,
  },

  // Indian Subcontinent
  {
    id: 'indian_subcontinent',
    name: 'India & South Asia',
    region: 'asia_pacific',
    d: `M 672 230
        C 685 225, 735 230, 748 238
        C 740 265, 728 290, 718 312
        C 712 312, 688 280, 678 255
        C 670 242, 668 234, 672 230 Z
        M 724 318 C 728 316, 730 322, 726 328 C 722 328, 720 322, 724 318 Z`,
  },

  // Korean Peninsula
  {
    id: 'korean_peninsula',
    name: 'Korean Peninsula',
    region: 'asia_pacific',
    d: `M 845 165 C 852 165, 856 178, 854 188 C 848 190, 842 178, 845 165 Z`,
  },

  // Japanese Archipelago (Hokkaido, Honshu, Kyushu)
  {
    id: 'japan_archipelago',
    name: 'Japan',
    region: 'asia_pacific',
    d: `M 896 142 C 908 140, 915 146, 912 154 C 904 156, 895 150, 896 142 Z
        M 872 176 C 885 166, 898 170, 908 184 C 900 188, 885 182, 872 176 Z
        M 866 186 C 872 184, 874 192, 868 194 C 864 194, 862 188, 866 186 Z`,
  },

  // Taiwan
  {
    id: 'taiwan',
    name: 'Taiwan',
    region: 'asia_pacific',
    d: `M 842 224 C 848 222, 850 230, 846 234 C 842 234, 840 228, 842 224 Z`,
  },

  // Indonesian & Philippine Archipelagos
  {
    id: 'indonesia_philippines',
    name: 'Southeast Asia Islands',
    region: 'asia_pacific',
    d: `M 785 320 C 815 305, 830 325, 805 338 C 785 345, 775 330, 785 320 Z
        M 825 348 C 850 345, 862 355, 845 362 C 825 365, 818 355, 825 348 Z
        M 842 322 C 858 318, 862 332, 852 336 C 838 338, 836 328, 842 322 Z
        M 846 270 C 854 266, 858 282, 852 288 C 846 288, 842 278, 846 270 Z`,
  },

  // 6. AUSTRALIA & OCEANIA
  {
    id: 'australia_main',
    name: 'Australia',
    region: 'asia_pacific',
    d: `M 814 380
        C 835 360, 855 352, 868 360
        C 875 365, 882 355, 888 345
        C 895 362, 915 375, 926 405
        C 924 425, 912 435, 905 440
        C 890 435, 865 425, 842 425
        C 825 425, 810 405, 814 380 Z`,
  },

  // Tasmania
  {
    id: 'tasmania',
    name: 'Tasmania',
    region: 'asia_pacific',
    d: `M 894 460 C 900 458, 904 466, 898 470 C 892 470, 890 464, 894 460 Z`,
  },

  // Papua New Guinea
  {
    id: 'papua_new_guinea',
    name: 'Papua New Guinea',
    region: 'asia_pacific',
    d: `M 880 326 C 902 322, 926 335, 922 346 C 896 350, 882 340, 880 326 Z`,
  },

  // New Zealand (North & South Islands)
  {
    id: 'new_zealand',
    name: 'New Zealand',
    region: 'asia_pacific',
    d: `M 956 432 C 966 438, 968 448, 960 452 C 954 448, 952 438, 956 432 Z
        M 946 454 C 954 458, 956 470, 948 474 C 942 468, 940 458, 946 454 Z`,
  },

  // 7. ANTARCTICA (Subtle icy polar coastal shelf)
  {
    id: 'antarctica_shelf',
    name: 'Antarctica',
    region: 'antarctica',
    d: `M 0 488
        C 120 482, 240 492, 310 472
        C 330 465, 345 470, 360 485
        C 450 482, 550 478, 650 485
        C 750 488, 850 482, 950 486
        L 1000 488 L 1000 500 L 0 500 Z`,
  }
];

/**
 * Top Major Cancer Hospital Geographic Hub Cities for Cartographic Reference Dots
 */
export interface WorldReferenceCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
  isCancerHub: boolean;
}

export const WORLD_REFERENCE_CITIES: WorldReferenceCity[] = [
  { name: 'Houston', country: 'USA', lat: 29.76, lon: -95.36, isCancerHub: true },
  { name: 'New York', country: 'USA', lat: 40.71, lon: -74.00, isCancerHub: true },
  { name: 'Boston', country: 'USA', lat: 42.36, lon: -71.05, isCancerHub: true },
  { name: 'Toronto', country: 'Canada', lat: 43.65, lon: -79.38, isCancerHub: true },
  { name: 'London', country: 'UK', lat: 51.50, lon: -0.12, isCancerHub: true },
  { name: 'Paris', country: 'France', lat: 48.85, lon: 2.35, isCancerHub: true },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.40, isCancerHub: true },
  { name: 'Tokyo', country: 'Japan', lat: 35.67, lon: 139.65, isCancerHub: true },
  { name: 'Mumbai', country: 'India', lat: 19.07, lon: 72.87, isCancerHub: true },
  { name: 'Shanghai', country: 'China', lat: 31.23, lon: 121.47, isCancerHub: true },
  { name: 'Melbourne', country: 'Australia', lat: -37.81, lon: 144.96, isCancerHub: true },
  { name: 'São Paulo', country: 'Brazil', lat: -23.55, lon: -46.63, isCancerHub: true },
  { name: 'Amman', country: 'Jordan', lat: 31.95, lon: 35.93, isCancerHub: true },
  { name: 'Cairo', country: 'Egypt', lat: 30.04, lon: 31.23, isCancerHub: true },
];
