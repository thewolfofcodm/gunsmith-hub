import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import {
  Search,
  Plus,
  Compass,
  Crosshair,
  ChevronDown,
  CheckCircle2,
  ShieldAlert,
  User,
  Trash2,
  Lock,
  Pencil,
  X,
  Database,
  Copy,
  Check,
  Heart,
  Flag,
  Megaphone,
  Send,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Trophy,
} from "lucide-react";

/* ============================================================================
   PRODUCTION DEPLOYMENT INSTRUCTIONS (NETLIFY / VERCEL)
   ============================================================================ */
const MY_PRODUCTION_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAkV8B6nIaa3JoAnklgEgD1sDw1eU8mVf4",
  authDomain: "gunsmith-hub.firebaseapp.com",
  projectId: "gunsmith-hub",
  storageBucket: "gunsmith-hub.firebasestorage.app",
  messagingSenderId: "156954616875",
  appId: "1:156954616875:web:72c294fe49881f867cf66e",
};

const firebaseConfig = MY_PRODUCTION_FIREBASE_CONFIG;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = "codm-gunsmith-hub-live";

const APP_VERSION = "v1.2.0";
const CHANGELOG_ITEMS = [
  {
    version: "v1.2.0",
    date: "September 2026",
    title: "Meta Tier List & Interactive Changelog",
    changes: [
      "Added dynamic Meta Tier List tab calculating S, A, B, and C tiers automatically from community upvotes.",
      "Added clickable version number in footer opening full changelog.",
      "Refined mobile responsive scrolling and touch targets.",
    ],
  },
  {
    version: "v1.1.0",
    date: "September 2026",
    title: "Multi-Reaction System & Nerfed Tag",
    changes: [
      "Upgraded reactions to include Thumbs Up, Thumbs Down, and Heart buttons.",
      "Replaced 'Off-Meta' with 'Nerfed' playstyle tag.",
      "Enhanced Super Admin DB Manager with record deletion and custom tagging.",
    ],
  },
  {
    version: "v1.0.0",
    date: "September 2026",
    title: "Initial Release",
    changes: [
      "Core GunsmithHub framework with dynamic attachment pickers.",
      "Secure passcode authentication and Super Admin mode.",
      "Anonymous community submissions and report moderation system.",
    ],
  },
];

const WEAPONS_DB = {
  "Assault Rifle": [
    "AK-47",
    "M4",
    "M16",
    "AK117",
    "BK57",
    "LK24",
    "ASM10",
    "Type 25",
    "ICR-1",
    "Man-O-War",
    "KN-44",
    "HBRa3",
    "HVK-30",
    "DR-H",
    "Peacekeeper MK2",
    "FR .556",
    "AS VAL",
    "CR-56 AMAX",
    "M13",
    "Swordfish",
    "Kilo 141",
    "Oden",
    "Krig 6",
    "EM2",
    "Maddox",
    "Grau 5.56",
    "Groza",
    "Type 19",
    "BP50",
    "ISO Hemlock",
    "BAL-27",
    "XM4",
    "LAG 53",
    "FFAR 1",
  ],
  SMG: [
    "RUS-79U",
    "Chicom",
    "PDW-57",
    "Razorback",
    "MSMC",
    "HG 40",
    "Pharo",
    "GKS",
    "Cordite",
    "QQ9",
    "Fennec",
    "AGR 556",
    "QXR",
    "PP19 Bizon",
    "MX9",
    "CBR4",
    "MAC-10",
    "KSP 45",
    "LAPA",
    "Switchblade X9",
    "OTs 9",
    "Striker 45",
    "CX-9",
    "Tec-9",
    "USS 9",
    "VMP",
    "Static-HV",
    "PPSh-41",
    "ISO",
  ],
  Sniper: [
    "DL Q33",
    "XPR-50",
    "M21 EBR",
    "Arctic .50",
    "Locus",
    "NA-45",
    "Outlaw",
    "Rytec AMR",
    "SVD",
    "Koshka",
    "ZRG 20mm",
    "HDR",
    "LW3-Tundra",
  ],
  LMG: [
    "S36",
    "UL736",
    "RPD",
    "M4LMG",
    "Chopper",
    "Holger 26",
    "Hades",
    "PKM",
    "Dingo",
    "Bruen MK9",
    "MG42",
  ],
  Marksman: ["Kilo Bolt-Action", "SKS", "SP-R 208", "MK2", "Type 63", "SO-14"],
  Shotgun: [
    "BY15",
    "HS0405",
    "HS2126",
    "Striker",
    "KRM-262",
    "Echo",
    "R9-0",
    "JAK-12",
    "Argus",
  ],
};

const ATTACHMENT_CATEGORIES = [
  "Muzzle",
  "Barrel",
  "Optic",
  "Stock",
  "Perk",
  "Laser",
  "Underbarrel",
  "Ammunition",
  "Rear Grip",
];
const PLAYSTYLE_TAGS = [
  "High Accuracy",
  "Fast ADS",
  "Aggressive",
  "High Mobility",
  "Low Recoil",
  "Long Range",
  "Silenced",
  "Meta",
  "Nerfed",
  "Balanced",
];

const UNIVERSAL_ATTACHMENTS = {
  Muzzle: [
    "Tactical Suppressor",
    "Monolithic Suppressor",
    "Light Suppressor",
    "RTC Compensator",
    "OWC Light Compensator",
    "MIP Flash Guard",
    "Agency Suppressor",
    "Maxim Silencer",
    "Marauder Suppressor",
    "Recoil Booster",
    "Colossus Suppressor",
  ],
  Optic: [
    "Classic Red Dot Sight",
    "Red Dot Sight 1",
    "Red Dot Sight 2",
    "Tactical Scope",
    "3X Tactical Scope 1",
    "4X Tactical Scope",
  ],
  Laser: [
    "OWC Laser - Tactical",
    "MIP Laser 5mW",
    "RTC Laser 1mW",
    "FSS OLE-V Laser",
    "1mW Artemis Laser",
    "Tiger Team Spotlight",
  ],
  Perk: [
    "FMJ",
    "Sleight of Hand",
    "Disable",
    "Full Ammo",
    "Wounding",
    "Toughness",
    "Melee Master",
  ],
  Underbarrel: [
    "Strike Foregrip",
    "Merc Foregrip",
    "Tactical Foregrip A",
    "Operator Foregrip",
    "Ranger Foregrip",
    "Field Agent Grip",
    "Stippled Grip Tape (Underbarrel)",
    "M1941 Hand Stop",
    "Commando Foregrip",
    "Infiltrator Grip",
  ],
  "Rear Grip": [
    "Granulated Grip Tape",
    "Stippled Grip Tape",
    "Rubberized Grip Tape",
    "Firm Grip Tape",
    "Rustle Grip Tape",
    "Serpent Wrap",
    "Hatched Grip",
    "Airborne Elastic Wrap",
  ],
};

const CLASS_DEFAULTS = {
  "Assault Rifle": {
    Barrel: [
      "MIP Light Barrel (Short)",
      "MIP Extended Light Barrel",
      "OWC Marksman",
      "RTC Silencer Barrel",
      "YKM Integral Suppressor Light",
    ],
    Stock: [
      "No Stock",
      "YKM Combat Stock",
      "OWC Skeleton Stock",
      "MIP Strike Stock",
      "RTC Steady Stock",
    ],
    Ammunition: ["Extended Mag A", "Large Extended Mag B", "Fast Reload"],
  },
  SMG: {
    Barrel: [
      "MIP Light Barrel (Short)",
      "MIP Extended Light Barrel",
      "OWC Marksman",
      "Task Force",
      "RTC Recon Tac Long",
    ],
    Stock: [
      "No Stock",
      "YKM Combat Stock",
      "OWC Skeleton Stock",
      "Raider Stock",
      "YKM Light Stock",
    ],
    Ammunition: [
      "Extended Mag A",
      "Large Extended Mag B",
      "Fast Reload",
      "40 Rnd Fast Mag",
    ],
  },
  Sniper: {
    Barrel: [
      "MIP Light",
      "Free Floating",
      "YKM Lightweight Short",
      "Tiger Team",
      "Oden Factory 810mm",
    ],
    Stock: ["YKM Combat Stock", "OWC Skeleton Stock", "No Stock", "Raider Pad"],
    Ammunition: ["Extended Mag A", "Fast Mag", "Large Extended Mag"],
  },
  LMG: {
    Barrel: ["MIP Light Barrel (Short)", "OWC Marksman"],
    Stock: ["No Stock", "YKM Combat Stock"],
    Ammunition: ["100 Round Belt", "120 Round Box"],
  },
  Marksman: {
    Barrel: ["MIP Light", "MIP Extended Light Barrel"],
    Stock: ["No Stock", "OWC Skeleton Stock", "OWC Ranger Stock"],
    Ammunition: ["Extended Mag A", "30 Round Extended Mag"],
  },
  Shotgun: {
    Barrel: [
      "Extended Light Barrel",
      "MIP Light Barrel (Short)",
      "Sawed-Off Barrel",
    ],
    Stock: ["No Stock", "YKM Combat Stock"],
    Ammunition: ["Extended Tube", "Slug Reload"],
  },
};

const WEAPON_OVERRIDES = {
  "AK-47": {
    Underbarrel: ["GRU Combo Grip", "Strike Foregrip"],
    Ammunition: ["5.45 Caliber Ammo", "Extended Mag A", "Extended Mag B"],
  },
  "HVK-30": {
    Ammunition: ["Large Caliber Ammo", "44 Round Extended Mag", "Fast Reload"],
  },
  "Peacekeeper MK2": {
    Barrel: [
      "Task Force Barrel",
      "Rapid Fire Barrel",
      "Well-Forged Barrel",
      "Built-In Silence Barrel",
    ],
    Underbarrel: ["Field Agent Grip", "Foregrip"],
    Ammunition: ["Double Stack Mag", "Advanced Reload"],
    "Rear Grip": ["Firm Grip Tape", "Rustle Grip Tape"],
  },
  EM2: {
    Muzzle: ["Agency Suppressor", "Suppressor"],
    Barrel: ['27.4" Ranger', '25.8" Task Force', '27.4" Cavalry Lancer'],
    Underbarrel: ["Field Agent Grip", "Striker Grip"],
    Ammunition: ["40 Round Extended Mag", "50 Round Extended Mag"],
    "Rear Grip": ["Airborne Elastic Wrap", "Firm Grip Tape"],
  },
  Maddox: {
    Barrel: ["Task Force Barrel", "Echo Fire Barrel"],
    Ammunition: ["Echo Fire Mod", "Fast Extended Mag A"],
  },
  "CR-56 AMAX": {
    Ammunition: ["M67 Ammo", "Extended Mag A", "Extended Mag B"],
  },
  "ISO Hemlock": {
    Muzzle: [
      "Tactical Suppressor",
      "Monolithic Suppressor",
      "Light Suppressor",
    ],
    Barrel: ["Fielder-T50", "LR-30/56", "Series 4-MR"],
    Stock: ["Mace - 600", "Res-2", "No Stock"],
    Ammunition: [".300 Blackout 30 Round", "45 Round Mag"],
  },
  "Grau 5.56": {
    Barrel: [
      'Tempus 26.4" Archangel',
      'FSS 20.8" Nexus',
      "ZLR Drifter A-08",
      "CZEN mk2",
    ],
    Stock: ["No Stock", "FSS Blackjack", "XRK StrikeLite III"],
    Ammunition: ["50 Round Mag", "60 Round Mag"],
  },
  BP50: {
    Muzzle: ["Maxim Silencer", "Recoil Booster"],
    Barrel: ["Leroy 438mm", "Leroy 414mm", "Desmet 540mm"],
    Stock: ["Leroy Custom", "Removed Stock", "Desmet Post"],
    Underbarrel: ["m1941 Hand Stop", "Carver Foregrip"],
    "Rear Grip": ["Hatched Grip", "Stippled Grip Tape"],
    Ammunition: ["60 Round Mag", "45 Round Mag", "50 Round Mag"],
  },
  Oden: {
    Muzzle: ["Colossus Suppressor", "Tactical Suppressor"],
    Barrel: ["Oden Factory 810mm", "Oden Factory 730mm", "Oden Factory 420mm"],
    Stock: ["Oden Factory Custom", "No Stock"],
    Ammunition: [
      "12 Round OTM Mag",
      "Large Extended Mag B",
      "Large Extended Mag A",
    ],
  },
  "Krig 6": {
    Muzzle: ["Agency Suppressor", "Suppressor"],
    Barrel: ["Task Force", "Ranger", "CMV Mil-Spec"],
    Stock: ["Agility Stock", "Skeleton Stock", "Tactical Stock"],
    Underbarrel: ["Field Agent Grip", "Striker Grip"],
    "Rear Grip": ["Airborne Elastic Wrap", "Firm Grip Tape"],
    Ammunition: ["Large Extended Mag B", "Fast Reload"],
  },
  "Type 19": {
    Barrel: ["North Industry 430mm", "Polymer 800mm", "Cavalry Lancer"],
    Stock: ["Agile Stock", "No Stock", "Marksman Stock"],
    Ammunition: [
      "75 Round Fast Reload",
      "60 Round Reload",
      "High Accuracy Ammo",
    ],
  },
  "Kilo 141": {
    Barrel: [
      "Extended Light Barrel",
      "Marksman Barrel",
      "YKM Integral Suppressor",
    ],
    Stock: ["No Stock", "OWC Skeleton Stock", "RTC Steady Stock"],
    Ammunition: ["100 Round Reload", "Large Extended Mag B", "Extended Mag A"],
  },
  "DR-H": {
    Barrel: ["OWC Marksman", "OWC Ranger", "MIP Light"],
    Stock: ["No Stock", "OWC Skeleton Stock"],
    Ammunition: ["25 Round OTM Mag", "30 Round OTM Mag", "Extended Mag A"],
  },
  M13: {
    Barrel: ["RTC Silencer Barrel", "Mini Barrel", "RTC Heavy Long"],
    Stock: ["No Stock", "RTC Combat Stock"],
    Ammunition: ["Large Extended Mag B", ".300 RTC Double Stack 40 Round"],
  },
  "BAL-27": {
    Barrel: ["BAL-27 Ranger", "BAL-27 Extended"],
    Stock: ["Tactical Stock"],
    Ammunition: ["42 Round Extended Mag"],
  },
  "AS VAL": {
    Barrel: ["MIP 200mm Mid-Range Barrel", "OWC Ranger", "200mm OWC"],
    Stock: ["OWC Skeleton Stock", "No Stock"],
    Ammunition: ["Large Extended Mag B", "15 Round FMJ"],
  },
  "LAG 53": {
    Barrel: ["LAG Factory 1", "LAG Factory 2"],
    Ammunition: ["40 Round Mag", "Extended Mag"],
  },
  "FFAR 1": {
    Barrel: ['21.2" Task Force', '19.5" Task Force', '20.3" Takedown'],
    Stock: ["Raider Stock", "SAS Combat Stock"],
    Underbarrel: ["Field Agent Grip", "Striker Grip"],
    Ammunition: ["44 Rnd", "STANAG 50 Rnd", "Fast Reload"],
    "Rear Grip": ["Airborne Elastic Wrap", "Serpent Wrap"],
  },
  "Static-HV": {
    Muzzle: [
      "Broadhead-3DP",
      "WULF Large Flame Hider",
      "Quartermaster Suppressor",
      "Zehmn35 Compensated Flash Hider",
      "Sonic Suppressor",
    ],
    Barrel: ["Auger 840mm", "Garza 762mm"],
    Stock: ["FSS OLE-V", "Spetsnaz Stock", "No Stock"],
    Underbarrel: [
      "Bruen Warrior Grip",
      "Paracord Grip",
      "DR-6 Handstop",
      "XTEN Phantom-5 Handstop",
    ],
    "Rear Grip": ["SK24 Grip"],
    Ammunition: ["50 Round Drum", "60 Round Drum"],
  },
  ISO: {
    Barrel: ["FSS Nightshade", '16" XL50', '9" CQB'],
    Stock: ["ISO Collapsible", "FORGE TAC Stalker"],
    Ammunition: ["50 Round Drum", "30 Round Mag"],
  },
  "Tec-9": {
    Muzzle: ["Burst Fire Repeater", "Auto Fire Repeater", "Agency Suppressor"],
    Barrel: ["Task Force Barrel", "Ranger Barrel"],
    Ammunition: ["STANAG 48 Round", "Fast Reload"],
  },
  "USS 9": {
    Muzzle: ["Sonic Suppressor", "Quartermaster Suppressor"],
    Barrel: ["USS Factory", "USS Short"],
    Ammunition: ["50 Round Mag", "40 Round Mag"],
  },
  "CX-9": {
    Barrel: ["CX-38S", "CX-23", "CX-23S"],
    Stock: ["CX-FR", "CX-M"],
    Ammunition: ["50 Round Drum", "12-Rnd Hollow Point"],
  },
  "MAC-10": {
    Muzzle: ["Agency Suppressor", "Suppressor"],
    Barrel: ['6.2" Cavalry Lancer', '5.9" Task Force', '5.3" Extended'],
    Stock: ["SAS Combat Stock", "Wire Stock"],
    Underbarrel: ["Striker Grip", "Field Agent Grip"],
    Ammunition: ["STANAG 53 Round Drum", "43 Round Fast Reload"],
  },
  "Striker 45": {
    Barrel: ["400mm Stainless Steel", "300mm Poly Barrel"],
    Stock: ["Lachmann Mk2 Light Stock", "FTac Precision Stock"],
    Ammunition: ["45 Round Auto Mag"],
  },
  "OTs 9": {
    Muzzle: ["Agency Suppressor", "Suppressor"],
    Barrel: ['8.1" Task Force', '7.1" Liberator'],
    Stock: ["KGB Skeletal Stock"],
    Ammunition: ["VDV 40 Rnd Fast Mag", "Spetsnaz 40 Rnd"],
  },
  "Switchblade X9": {
    Barrel: ["MIP Light Barrel (Short)", "MIP Extended Light Barrel"],
    Stock: ["OWC Skeleton Stock", "YKM Light Stock"],
    Ammunition: ["Extended Mag A", "Extended Mag B"],
  },
  QQ9: {
    Barrel: ["RTC Recon Tac Long", "MIP Tactical Barrel"],
    Ammunition: ["10mm 30 Round Reload", "45 Round Extended Mag"],
  },
  Fennec: {
    Barrel: ["MIP Extended Light Barrel", "MIP Light Barrel (Short)"],
    Stock: ["No Stock", "YKM Light Stock", "RTC Steady Stock"],
    Ammunition: ["Extended Mag A", "Extended Mag B"],
  },
  CBR4: {
    Barrel: [
      "OWC Marksman",
      "MIP Extended Light Barrel",
      "MIP Light Barrel (Short)",
    ],
    Stock: ["YKM Light Stock", "YKM Combat Stock"],
  },
  "DL Q33": {
    Barrel: ["MIP Light", "Free Floating", "YKM Combat"],
    Stock: ["YKM Combat Stock", "OWC Skeleton Stock", "No Stock"],
    Ammunition: ["Extended Mag A"],
  },
  Locus: {
    Barrel: ["YKM Lightweight Short", "YKM Lightweight Long"],
    Stock: ["OWC Skeleton Stock", "No Stock"],
    Ammunition: ["OWC Stopping Power Reload"],
  },
  "LW3-Tundra": {
    Muzzle: ["Tactical Suppressor", "Wrapped Suppressor"],
    Barrel: ["Tiger Team", "Hammer Forged"],
    Stock: ["Raider Pad", "SAS Combat Stock"],
    Ammunition: ["Fast Mag", "7 Rnd"],
  },
  Koshka: { Ammunition: ["Armor Piercing Mag", "Fast Extended Mag"] },
  "ZRG 20mm": { Ammunition: ["Anti-Vehicle Mag", "Armor Piercing Mag"] },
  HDR: {
    Barrel: ['26.9" HDR Pro'],
    Stock: ["FTAC Stalker-Scout", "FTAC Champion"],
    Ammunition: ["9 Round Mag"],
  },
  MG42: {
    Muzzle: ["Recoil Booster", "Maxim Silencer"],
    Barrel: ["VDD 890mm 32M Nacht", "Krausnick 450mm B42MG"],
    Stock: ["Krausnick S11 CS", "VGC Skeletal"],
    Underbarrel: ["m1941 Hand Stop", "Carver Foregrip"],
    "Rear Grip": ["Hatched Grip", "Stippled Grip Tape"],
    Ammunition: ["250 Round Box", "125 Round Belt"],
  },
  "Holger 26": {
    Barrel: ["MIP Light", "MIP Light Barrel (Short)"],
    Stock: ["No Stock", "YKM Combat Stock"],
    Ammunition: [
      "Holger-26K Double-Stack 30 Round",
      "Holger-26C Lightweight Polymer 35 Round",
    ],
  },
  SKS: {
    Barrel: ["MIP Extended Light Barrel", "MIP Light"],
    Stock: ["No Stock", "OWC Ranger Stock"],
    Ammunition: ["10 Round Light Reload", "30 Round Extended Mag"],
  },
};

const getAllWeapons = (cls: any, customDb: any) => {
  const base = WEAPONS_DB[cls] || [];
  const custom = customDb?.weapons?.[cls] || [];
  const hidden = customDb?.hidden?.weapons || [];
  return [...new Set([...base, ...custom])]
    .filter((w) => !hidden.includes(w))
    .sort();
};

const getAllClasses = (customDb: any) => {
  const baseClasses = Object.keys(WEAPONS_DB);
  const customClasses = customDb?.weapons ? Object.keys(customDb.weapons) : [];
  const hidden = customDb?.hidden?.classes || [];
  return [...new Set([...baseClasses, ...customClasses])]
    .filter((c) => !hidden.includes(c))
    .sort();
};

const getOptionsForCategory = (
  weapon,
  weaponClass,
  category,
  customDb = {}
) => {
  if (!weapon || !weaponClass) return [];

  let options = [];
  const exclusiveCategories = ["Barrel", "Stock", "Ammunition"];

  const baseOverrides =
    (WEAPON_OVERRIDES[weapon] && WEAPON_OVERRIDES[weapon][category]) || [];
  const customOverrides = customDb?.overrides?.[weapon]?.[category] || [];

  if (baseOverrides.length > 0) options = [...baseOverrides];
  else if (
    exclusiveCategories.includes(category) &&
    CLASS_DEFAULTS[weaponClass] &&
    CLASS_DEFAULTS[weaponClass][category]
  ) {
    options = [...CLASS_DEFAULTS[weaponClass][category]];
  }
  options = [...options, ...customOverrides];

  if (UNIVERSAL_ATTACHMENTS[category]) {
    options = [...options, ...UNIVERSAL_ATTACHMENTS[category]];
  }

  const hidden = customDb?.hidden?.attachments?.[weapon]?.[category] || [];
  return [...new Set(options)].filter((a) => !hidden.includes(a));
};

const SYSTEM_TEMPLATES = [
  {
    id: "sys-ar-1",
    weapon: "DR-H",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["High Accuracy", "Long Range", "Meta"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "OWC Marksman",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "25 Round OTM Mag",
    },
    timestamp: Date.now(),
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-1-flex",
    weapon: "DR-H",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Aggressive", "Fast ADS", "Balanced"],
    attachments: {
      Muzzle: "Tactical Suppressor",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "25 Round OTM Mag",
      "Rear Grip": "Granulated Grip Tape",
    },
    timestamp: Date.now() - 500,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-3",
    weapon: "BP50",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Meta", "High Accuracy", "Balanced"],
    attachments: {
      Muzzle: "Maxim Silencer",
      Barrel: "Leroy 438mm",
      Stock: "Leroy Custom",
      Laser: "FSS OLE-V Laser",
      Ammunition: "60 Round Mag",
    },
    timestamp: Date.now() - 2000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-3-aggro",
    weapon: "BP50",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Aggressive", "High Mobility", "Fast ADS"],
    attachments: {
      Muzzle: "Maxim Silencer",
      Barrel: "Leroy 438mm",
      Stock: "Removed Stock",
      Laser: "FSS OLE-V Laser",
      Ammunition: "60 Round Mag",
    },
    timestamp: Date.now() - 2500,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-4",
    weapon: "Kilo 141",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Long Range", "Low Recoil", "Balanced"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "Extended Light Barrel",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "Large Extended Mag B",
    },
    timestamp: Date.now() - 3000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-2",
    weapon: "BAL-27",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Balanced", "Meta", "Aggressive"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "BAL-27 Ranger",
      Stock: "No Stock",
      Underbarrel: "Operator Foregrip",
      Ammunition: "42 Round Extended Mag",
    },
    timestamp: Date.now() - 1000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-1",
    weapon: "Switchblade X9",
    class: "SMG",
    type: "System Verified",
    tags: ["Aggressive", "High Mobility", "Meta"],
    attachments: {
      Muzzle: "Tactical Suppressor",
      Barrel: "MIP Light Barrel (Short)",
      Stock: "OWC Skeleton Stock",
      Underbarrel: "Stippled Grip Tape",
      Ammunition: "Extended Mag A",
    },
    timestamp: Date.now() - 6000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-2",
    weapon: "VMP",
    class: "SMG",
    type: "System Verified",
    tags: ["Balanced", "High Accuracy", "Meta"],
    attachments: {
      Muzzle: "Agency Suppressor",
      Barrel: "Task Force",
      Stock: "Raider Stock",
      Underbarrel: "Field Agent Grip",
      Ammunition: "40 Rnd Fast Mag",
    },
    timestamp: Date.now() - 7000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-6",
    weapon: "Static-HV",
    class: "SMG",
    type: "System Verified",
    tags: ["Meta", "Fast ADS", "High Mobility"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "Light Barrel",
      Stock: "Combat Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "50 Round Drum",
    },
    timestamp: Date.now() - 11000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-sniper-1",
    weapon: "DL Q33",
    class: "Sniper",
    type: "System Verified",
    tags: ["Fast ADS", "Meta", "Aggressive"],
    attachments: {
      Barrel: "MIP Light",
      Stock: "YKM Combat Stock",
      Laser: "OWC Laser - Tactical",
      Perk: "FMJ",
      Ammunition: "Extended Mag A",
    },
    timestamp: Date.now() - 12000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "pro-1",
    weapon: "DR-H",
    class: "Assault Rifle",
    type: "Pro Build",
    authorName: "iFerg",
    tags: ["Aggressive", "Meta", "High Mobility"],
    attachments: {
      Muzzle: "Tactical Suppressor",
      Barrel: "OWC Marksman",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "25 Round OTM Mag",
    },
    timestamp: Date.now() - 1000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-5",
    weapon: "Type 19",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Balanced", "Low Recoil"],
    attachments: {
      Barrel: "North Industry 430mm",
      Stock: "Agile Stock",
      Ammunition: "60 Round Reload",
    },
    timestamp: Date.now() - 4000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-6",
    weapon: "Grau 5.56",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["High Accuracy", "Meta"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: 'Tempus 26.4" Archangel',
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "50 Round Mag",
    },
    timestamp: Date.now() - 4500,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-7",
    weapon: "FFAR 1",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Fast ADS", "Aggressive"],
    attachments: {
      Muzzle: "Agency Suppressor",
      Barrel: '21.2" Task Force',
      Stock: "Raider Stock",
      Underbarrel: "Field Agent Grip",
      Ammunition: "STANAG 50 Rnd",
    },
    timestamp: Date.now() - 5000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-3",
    weapon: "QQ9",
    class: "SMG",
    type: "System Verified",
    tags: ["Fast ADS", "High Mobility"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "RTC Recon Tac Long",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "10mm 30 Round Reload",
    },
    timestamp: Date.now() - 8000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-4",
    weapon: "CX-9",
    class: "SMG",
    type: "System Verified",
    tags: ["Aggressive", "Close Range"],
    attachments: {
      Barrel: "CX-38S",
      Stock: "CX-FR",
      Laser: "Tiger Team Spotlight",
      Underbarrel: "Merc Foregrip",
      Ammunition: "50 Round Drum",
    },
    timestamp: Date.now() - 8500,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-5",
    weapon: "Fennec",
    class: "SMG",
    type: "System Verified",
    tags: ["High Mobility", "Aggressive"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "MIP Extended Light Barrel",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "Extended Mag A",
    },
    timestamp: Date.now() - 9000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-7",
    weapon: "MAC-10",
    class: "SMG",
    type: "System Verified",
    tags: ["Close Range", "Fast ADS"],
    attachments: {
      Muzzle: "Agency Suppressor",
      Barrel: '6.2" Cavalry Lancer',
      Stock: "SAS Combat Stock",
      Underbarrel: "Striker Grip",
      Ammunition: "STANAG 53 Round Drum",
    },
    timestamp: Date.now() - 9500,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-sniper-2",
    weapon: "Locus",
    class: "Sniper",
    type: "System Verified",
    tags: ["Fast ADS", "Aggressive"],
    attachments: {
      Barrel: "YKM Lightweight Short",
      Stock: "OWC Skeleton Stock",
      Laser: "OWC Laser - Tactical",
      Perk: "FMJ",
      Ammunition: "OWC Stopping Power Reload",
    },
    timestamp: Date.now() - 13000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-sniper-3",
    weapon: "LW3-Tundra",
    class: "Sniper",
    type: "System Verified",
    tags: ["Meta", "High Accuracy"],
    attachments: {
      Muzzle: "Tactical Suppressor",
      Barrel: "Tiger Team",
      Stock: "Raider Pad",
      Ammunition: "7 Rnd",
      "Rear Grip": "Serpent Wrap",
    },
    timestamp: Date.now() - 14000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-lmg-1",
    weapon: "Holger 26",
    class: "LMG",
    type: "System Verified",
    tags: ["Balanced", "Long Range"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Underbarrel: "Tactical Foregrip A",
      "Rear Grip": "Granulated Grip Tape",
    },
    timestamp: Date.now() - 15000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-lmg-2",
    weapon: "MG42",
    class: "LMG",
    type: "System Verified",
    tags: ["Meta", "High Accuracy"],
    attachments: {
      Muzzle: "Recoil Booster",
      Barrel: "VDD 890mm 32M Nacht",
      Stock: "Krausnick S11 CS",
      Underbarrel: "m1941 Hand Stop",
      "Rear Grip": "Hatched Grip",
    },
    timestamp: Date.now() - 16000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-shotgun-1",
    weapon: "KRM-262",
    class: "Shotgun",
    type: "System Verified",
    tags: ["Aggressive", "High Mobility"],
    attachments: {
      Muzzle: "Marauder Suppressor",
      Barrel: "Extended Light Barrel",
      Stock: "No Stock",
      Laser: "MIP Laser 5mW",
      "Rear Grip": "Granulated Grip Tape",
    },
    timestamp: Date.now() - 17000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "pro-2",
    weapon: "Switchblade X9",
    class: "SMG",
    type: "Pro Build",
    authorName: "BobbyPlays",
    tags: ["Meta", "Aggressive"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "MIP Light Barrel (Short)",
      Stock: "OWC Skeleton Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "Extended Mag A",
    },
    timestamp: Date.now() - 18000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "pro-3",
    weapon: "Krig 6",
    class: "Assault Rifle",
    type: "Pro Build",
    authorName: "NoahFromYoutube",
    tags: ["High Accuracy", "Balanced"],
    attachments: {
      Muzzle: "Agency Suppressor",
      Barrel: "Task Force",
      Optic: "Classic Red Dot Sight",
      Underbarrel: "Field Agent Grip",
      Ammunition: "Large Extended Mag B",
    },
    timestamp: Date.now() - 19000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-8",
    weapon: "Maddox",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Low Recoil", "Balanced"],
    attachments: {
      Barrel: "Task Force Barrel",
      Underbarrel: "Field Agent Grip",
      Ammunition: "Echo Fire Mod",
      "Rear Grip": "Firm Grip Tape",
    },
    timestamp: Date.now() - 20000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-9",
    weapon: "AS VAL",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Aggressive", "Fast ADS", "Silenced"],
    attachments: {
      Barrel: "MIP 200mm Mid-Range Barrel",
      Stock: "OWC Skeleton Stock",
      Laser: "OWC Laser - Tactical",
      Underbarrel: "Strike Foregrip",
      Ammunition: "Large Extended Mag B",
    },
    timestamp: Date.now() - 21000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-10",
    weapon: "AK-47",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["High Accuracy", "Long Range"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "OWC Marksman",
      Stock: "No Stock",
      Underbarrel: "Strike Foregrip",
      Ammunition: "Extended Mag A",
    },
    timestamp: Date.now() - 22000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-8",
    weapon: "CBR4",
    class: "SMG",
    type: "System Verified",
    tags: ["Meta", "High Mobility"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "OWC Marksman",
      Stock: "YKM Light Stock",
      Laser: "OWC Laser - Tactical",
      "Rear Grip": "Granulated Grip Tape",
    },
    timestamp: Date.now() - 23000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-9",
    weapon: "PP19 Bizon",
    class: "SMG",
    type: "System Verified",
    tags: ["Low Recoil", "Balanced"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "MIP Extended Light Barrel",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "Large Extended Mag B",
    },
    timestamp: Date.now() - 24000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-sniper-4",
    weapon: "Arctic .50",
    class: "Sniper",
    type: "System Verified",
    tags: ["Long Range", "Meta"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "MIP Custom Long",
      Stock: "YKM Combat Stock",
      Perk: "FMJ",
      Ammunition: "Stopping Power Reload",
    },
    timestamp: Date.now() - 25000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-lmg-3",
    weapon: "Chopper",
    class: "LMG",
    type: "System Verified",
    tags: ["Aggressive", "High Mobility"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "Chopper Special Forces",
      Laser: "OWC Laser - Tactical",
      Underbarrel: "Heavy Handle",
      Perk: "FMJ",
    },
    timestamp: Date.now() - 26000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-marksman-1",
    weapon: "SKS",
    class: "Marksman",
    type: "System Verified",
    tags: ["High Accuracy", "Meta"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "MIP Extended Light Barrel",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "30 Round Extended Mag",
    },
    timestamp: Date.now() - 27000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-11",
    weapon: "Peacekeeper MK2",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Fast ADS", "High Mobility"],
    attachments: {
      Barrel: "Task Force Barrel",
      Stock: "Agile Stock",
      Underbarrel: "Field Agent Grip",
      Ammunition: "Double Stack Mag",
      "Rear Grip": "Firm Grip Tape",
    },
    timestamp: Date.now() - 28000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-12",
    weapon: "ISO Hemlock",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Meta", "Balanced"],
    attachments: {
      Muzzle: "Tactical Suppressor",
      Barrel: "Fielder-T50",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "45 Round Mag",
    },
    timestamp: Date.now() - 29000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-10",
    weapon: "OTs 9",
    class: "SMG",
    type: "System Verified",
    tags: ["Close Range", "Aggressive"],
    attachments: {
      Muzzle: "Agency Suppressor",
      Barrel: '8.1" Task Force',
      Stock: "KGB Skeletal Stock",
      Laser: "Tiger Team Spotlight",
      Ammunition: "VDV 40 Rnd Fast Mag",
    },
    timestamp: Date.now() - 30000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "pro-4",
    weapon: "Koshka",
    class: "Sniper",
    type: "Pro Build",
    authorName: "Miney",
    tags: ["Fast ADS", "Aggressive"],
    attachments: {
      Barrel: "MIP Light",
      Stock: "Mobility Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "Armor Piercing Mag",
      "Rear Grip": "Stippled Grip Tape",
    },
    timestamp: Date.now() - 31000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-lmg-4",
    weapon: "RPD",
    class: "LMG",
    type: "System Verified",
    tags: ["Long Range", "Low Recoil"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "OWC Extended Barrel",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Underbarrel: "Cooling Compressor Barrel",
    },
    timestamp: Date.now() - 32000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-11",
    weapon: "LAPA",
    class: "SMG",
    type: "System Verified",
    tags: ["High Accuracy", "Balanced"],
    attachments: {
      Muzzle: "Agency Suppressor",
      Barrel: '8.7" Rifled',
      Stock: "Raider Stock",
      Laser: "Tiger Team Spotlight",
      Ammunition: "Salvo 50 Rnd Fast Mag",
    },
    timestamp: Date.now() - 33000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-13",
    weapon: "EM2",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Meta", "Long Range"],
    attachments: {
      Muzzle: "Agency Suppressor",
      Barrel: '27.4" Ranger',
      Stock: "No Stock",
      Underbarrel: "Field Agent Grip",
      Ammunition: "40 Round Extended Mag",
    },
    timestamp: Date.now() - 34000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-shotgun-2",
    weapon: "Argus",
    class: "Shotgun",
    type: "System Verified",
    tags: ["High Accuracy", "Meta"],
    attachments: {
      Muzzle: "Choke",
      Barrel: "Long Barrel",
      Stock: "Combat Stock",
      Laser: "MIP Laser 5mW",
      "Rear Grip": "Granulated Grip Tape",
    },
    timestamp: Date.now() - 35000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-marksman-2",
    weapon: "SP-R 208",
    class: "Marksman",
    type: "System Verified",
    tags: ["Fast ADS", "Aggressive"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "MIP Light",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: ".300 5 Round Reload",
    },
    timestamp: Date.now() - 36000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-12",
    weapon: "PDW-57",
    class: "SMG",
    type: "System Verified",
    tags: ["Balanced", "Low Recoil"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "OWC Marksman",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      "Rear Grip": "Granulated Grip Tape",
    },
    timestamp: Date.now() - 37000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "pro-5",
    weapon: "M13",
    class: "Assault Rifle",
    type: "Pro Build",
    authorName: "Jokesta",
    tags: ["High Fire Rate", "Meta"],
    attachments: {
      Muzzle: "Silencer Barrel",
      Stock: "No Stock",
      Laser: "OWC Laser - Tactical",
      Underbarrel: "Strike Foregrip",
      Ammunition: ".300 RTC Double Stack 40 Round",
    },
    timestamp: Date.now() - 38000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-14",
    weapon: "Type 25",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Aggressive", "Close Range"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "MIP Light Barrel (Short)",
      Stock: "YKM Combat Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "Stopping Power Reload",
    },
    timestamp: Date.now() - 39000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-ar-15",
    weapon: "Kilo 141",
    class: "Assault Rifle",
    type: "System Verified",
    tags: ["Low Recoil", "Long Range"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "OWC Marksman",
      Stock: "RTC Steady Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "Large Extended Mag B",
    },
    timestamp: Date.now() - 40000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-sniper-5",
    weapon: "Rytec AMR",
    class: "Sniper",
    type: "System Verified",
    tags: ["Anti-Vehicle", "Long Range"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "OWC Marksman",
      Stock: "OWC Skeleton Stock",
      Perk: "Full Ammo",
      Ammunition: "Explosive Mag",
    },
    timestamp: Date.now() - 41000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-sniper-6",
    weapon: "ZRG 20mm",
    class: "Sniper",
    type: "System Verified",
    tags: ["Anti-Vehicle", "Meta"],
    attachments: {
      Muzzle: "Monolithic Suppressor",
      Barrel: "MIP Light",
      Stock: "YKM Combat Stock",
      Laser: "OWC Laser - Tactical",
      Ammunition: "Anti-Vehicle Mag",
    },
    timestamp: Date.now() - 42000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
  {
    id: "sys-smg-13",
    weapon: "Tec-9",
    class: "SMG",
    type: "System Verified",
    tags: ["Aggressive", "High Mobility"],
    attachments: {
      Muzzle: "Burst Fire Repeater",
      Barrel: "Task Force Barrel",
      Stock: "Agile Stock",
      Laser: "Tiger Team Spotlight",
      Ammunition: "STANAG 48 Round",
    },
    timestamp: Date.now() - 43000,
    likedBy: [],
    dislikedBy: [],
    heartedBy: [],
  },
];

const Badge = ({ children, active, onClick, type = "default" }) => {
  const baseStyle =
    "px-3.5 py-1.5 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-300 backdrop-blur-md whitespace-nowrap flex-shrink-0 border";
  let styles = "";
  if (type === "system")
    styles = "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
  else if (type === "community")
    styles = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  else if (type === "pro")
    styles = "bg-amber-500/20 text-amber-300 border-amber-500/30";
  else if (type === "admin-fav")
    styles =
      "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.2)]";
  else if (onClick)
    styles = active
      ? "bg-white/10 text-white border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.15)] cursor-pointer scale-[1.02]"
      : "bg-transparent text-gray-400 border-white/10 hover:bg-white/5 hover:text-white cursor-pointer active:scale-95";
  else styles = "bg-white/5 text-gray-300 border-white/10";
  return (
    <span onClick={onClick} className={`${baseStyle} ${styles}`}>
      {children}
    </span>
  );
};

const ExpandedLoadoutModal = ({
  loadout,
  onClose,
  currentUser,
  onReact,
  isAdmin,
  onDelete,
  onEdit,
  onReport,
}) => {
  const [copied, setCopied] = useState(false);

  const hasLiked = currentUser && loadout.likedBy?.includes(currentUser.uid);
  const hasDisliked =
    currentUser && loadout.dislikedBy?.includes(currentUser.uid);
  const hasHearted =
    currentUser && loadout.heartedBy?.includes(currentUser.uid);
  const likeCount = loadout.likedBy?.length || 0;
  const dislikeCount = loadout.dislikedBy?.length || 0;
  const heartCount = loadout.heartedBy?.length || 0;

  const isOwner = currentUser && loadout.userId === currentUser.uid;
  const canEditDelete = isAdmin || (isOwner && !loadout.isLocked);
  const hasReported =
    currentUser && loadout.reportedBy?.includes(currentUser.uid);

  const handleCopy = () => {
    let copyText = `🔥 ${loadout.weapon} (${loadout.class}) Loadout\n`;
    copyText += `👤 By: ${loadout.authorName || "Community"}\n\n`;
    if (loadout.attachments) {
      ATTACHMENT_CATEGORIES.forEach((category) => {
        if (loadout.attachments[category])
          copyText += `• ${category}: ${loadout.attachments[category]}\n`;
      });
    }
    copyText += `\n🏷️ Playstyle: ${loadout.tags?.join(
      ", "
    )}\n👉 Found on CODM Gunsmith Hub`;
    const textArea = document.createElement("textarea");
    textArea.value = copyText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-[#121214] border border-white/10 rounded-[32px] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all z-10 backdrop-blur-md border border-white/5 hover:scale-110 active:scale-95"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 relative">
          <div className="mb-8 pr-12">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {loadout.weapon}
              </h2>
              {loadout.isAdminFav && (
                <div
                  title="Admin's Favorite"
                  className="flex items-center gap-1.5 bg-fuchsia-500/20 border border-fuchsia-500/40 px-3 py-1 rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.3)] self-start mt-1"
                >
                  <Bookmark className="w-5 h-5 text-fuchsia-400 fill-current" />
                  <span className="text-sm font-black text-fuchsia-300 uppercase tracking-wider hidden sm:inline">
                    Admin's Pick
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[14px] sm:text-[16px] text-gray-400 font-medium">
              <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-gray-300">
                {loadout.class}
              </span>
              <span className="opacity-50">•</span>
              <span>
                By{" "}
                <span
                  className={
                    loadout.type === "Pro Build"
                      ? "text-amber-300 font-bold"
                      : loadout.type === "Admin's Fav"
                      ? "text-fuchsia-400 font-bold drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]"
                      : "text-gray-200 font-bold"
                  }
                >
                  {loadout.authorName ||
                    (loadout.type?.toLowerCase()?.includes("system")
                      ? "System"
                      : "Anonymous")}
                </span>
              </span>
            </div>
          </div>
          {loadout.tags && loadout.tags.length > 0 && (
            <div className="mb-10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Playstyle
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {loadout.tags.map((tag) => (
                  <Badge
                    key={tag}
                    type={
                      loadout.type === "Pro Build"
                        ? "pro"
                        : loadout.type === "Admin's Fav"
                        ? "admin-fav"
                        : loadout.type === "System Verified"
                        ? "system"
                        : "community"
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> Gunsmith Setup
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ATTACHMENT_CATEGORIES.map((category) => {
                if (!loadout.attachments || !loadout.attachments[category])
                  return null;
                return (
                  <div
                    key={category}
                    className="bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-all flex flex-col gap-1"
                  >
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-indigo-400">
                      {category}
                    </span>
                    <span className="text-[15px] sm:text-lg font-semibold text-gray-100">
                      {loadout.attachments[category]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-6 border-t border-white/10 bg-[#151517] flex flex-wrap items-center gap-3 justify-between rounded-b-[32px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full p-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReact(loadout, "like");
                }}
                className={`p-2 sm:px-3 rounded-full flex items-center gap-1.5 transition-all active:scale-95 ${
                  hasLiked
                    ? "text-emerald-400 bg-emerald-500/20"
                    : "text-gray-400 hover:text-emerald-400 hover:bg-white/10"
                }`}
              >
                <ThumbsUp
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    hasLiked ? "fill-current" : ""
                  }`}
                />
                <span className="text-xs sm:text-sm font-bold">
                  {likeCount}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReact(loadout, "dislike");
                }}
                className={`p-2 sm:px-3 rounded-full flex items-center gap-1.5 transition-all active:scale-95 ${
                  hasDisliked
                    ? "text-rose-400 bg-rose-500/20"
                    : "text-gray-400 hover:text-rose-400 hover:bg-white/10"
                }`}
              >
                <ThumbsDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    hasDisliked ? "fill-current" : ""
                  }`}
                />
                <span className="text-xs sm:text-sm font-bold">
                  {dislikeCount}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReact(loadout, "heart");
                }}
                className={`p-2 sm:px-3 rounded-full flex items-center gap-1.5 transition-all active:scale-95 ${
                  hasHearted
                    ? "text-pink-400 bg-pink-500/20"
                    : "text-gray-400 hover:text-pink-400 hover:bg-white/10"
                }`}
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    hasHearted ? "fill-current" : ""
                  }`}
                />
                <span className="text-xs sm:text-sm font-bold">
                  {heartCount}
                </span>
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-gray-200 active:scale-95 transition-all text-sm sm:text-base"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied!" : "Copy Build"}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {!isOwner && !isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReport && onReport(loadout);
                }}
                disabled={hasReported}
                className={`p-3 rounded-full transition-all active:scale-95 ${
                  hasReported
                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-not-allowed"
                    : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
                title={hasReported ? "Reported" : "Report"}
              >
                <Flag
                  className={`w-5 h-5 ${hasReported ? "fill-current" : ""}`}
                />
              </button>
            )}
            {canEditDelete && (
              <React.Fragment>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(loadout);
                  }}
                  className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full hover:bg-indigo-500/20 active:scale-95 transition-all"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onDelete(loadout.id);
                  }}
                  className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full hover:bg-rose-500/20 active:scale-95 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadoutCard = ({
  loadout,
  currentUser,
  onReact,
  isAdmin,
  onDelete,
  onEdit,
  onReport,
  onExpand,
}) => {
  const [copied, setCopied] = useState(false);
  const hasLiked = currentUser && loadout.likedBy?.includes(currentUser.uid);
  const hasDisliked =
    currentUser && loadout.dislikedBy?.includes(currentUser.uid);
  const hasHearted =
    currentUser && loadout.heartedBy?.includes(currentUser.uid);
  const likeCount = loadout.likedBy?.length || 0;
  const dislikeCount = loadout.dislikedBy?.length || 0;
  const heartCount = loadout.heartedBy?.length || 0;
  const isOwner = currentUser && loadout.userId === currentUser.uid;
  const canEditDelete = isAdmin || (isOwner && !loadout.isLocked);
  const hasReported =
    currentUser && loadout.reportedBy?.includes(currentUser.uid);

  const handleCopy = () => {
    let copyText = `🔥 ${loadout.weapon} (${loadout.class}) Loadout\n👤 By: ${
      loadout.authorName || "Community"
    }\n\n`;
    if (loadout.attachments) {
      ATTACHMENT_CATEGORIES.forEach((cat) => {
        if (loadout.attachments[cat])
          copyText += `• ${cat}: ${loadout.attachments[cat]}\n`;
      });
    }
    copyText += `\n🏷️ Playstyle: ${loadout.tags?.join(
      ", "
    )}\n👉 Found on CODM Gunsmith Hub`;
    const textArea = document.createElement("textarea");
    textArea.value = copyText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  return (
    <div
      onClick={onExpand}
      className={`group relative w-full rounded-[24px] bg-[#121214]/85 backdrop-blur-2xl border ${
        loadout.isAdminFav
          ? "border-fuchsia-500/40 shadow-[0_8px_30px_rgba(217,70,239,0.15)] hover:shadow-[0_20px_40px_rgba(217,70,239,0.3)] hover:border-fuchsia-500/60"
          : "border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:border-white/20"
      } overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col p-5 cursor-pointer`}
    >
      <div className="flex justify-between items-start mb-6 gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-md truncate">
              {loadout.weapon}
            </h3>
            {loadout.isAdminFav && (
              <div
                title="Admin's Favorite"
                className="flex items-center gap-1 bg-fuchsia-500/20 border border-fuchsia-500/40 px-2 py-0.5 rounded-md shadow-[0_0_12px_rgba(217,70,239,0.5)] shrink-0 relative -top-0.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-fuchsia-400 fill-current" />
                <span className="text-[10px] font-bold text-fuchsia-300 uppercase tracking-wider hidden sm:inline">
                  Admin's Pick
                </span>
              </div>
            )}
          </div>
          <p className="text-[13px] text-gray-400 font-medium flex items-center flex-wrap gap-1">
            {loadout.class} <span className="opacity-50 mx-1">•</span> By{" "}
            <span
              className={
                loadout.type === "Pro Build"
                  ? "text-amber-200"
                  : "text-gray-200"
              }
            >
              {loadout.authorName ||
                (loadout.type?.toLowerCase()?.includes("system")
                  ? "System"
                  : "Anonymous")}
            </span>
            {loadout.isLocked && (
              <Lock
                className="w-3.5 h-3.5 text-rose-400 ml-1"
                title="Locked by Admin"
              />
            )}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1.5 bg-white/5 text-gray-300 border border-white/10 rounded-full hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95 transition-all"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          {!isOwner && !isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReport && onReport(loadout);
              }}
              disabled={hasReported}
              className={`p-1.5 rounded-full transition-all active:scale-95 ${
                hasReported
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-not-allowed"
                  : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-110"
              }`}
            >
              <Flag
                className={`w-4 h-4 ${hasReported ? "fill-current" : ""}`}
              />
            </button>
          )}
          {canEditDelete && (
            <React.Fragment>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(loadout);
                }}
                className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full hover:bg-indigo-500/20 hover:scale-110 active:scale-95 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(loadout.id);
                }}
                className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full hover:bg-rose-500/20 hover:scale-110 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
      {isAdmin && loadout.reportedBy?.length > 0 && (
        <div className="absolute top-0 right-0 mt-3 mr-3 bg-rose-500/20 text-rose-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-rose-500/30 z-10 shadow-lg flex items-center gap-1 backdrop-blur-md">
          <Flag className="w-3 h-3 fill-current" /> {loadout.reportedBy.length}{" "}
          Reports
        </div>
      )}
      <div className="flex-1 flex flex-col gap-3 mb-6">
        {loadout.attachments &&
          ATTACHMENT_CATEGORIES.map((category) => {
            if (!loadout.attachments[category]) return null;
            return (
              <div
                key={category}
                className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors gap-3"
              >
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 shrink-0">
                  {category}
                </span>
                <span className="text-[14px] font-semibold text-gray-200 text-right truncate">
                  {loadout.attachments[category]}
                </span>
              </div>
            );
          })}
      </div>
      <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-2 flex-1 mr-4">
          {loadout.tags &&
            loadout.tags.map((tag) => (
              <Badge
                key={tag}
                type={
                  loadout.type === "Pro Build"
                    ? "pro"
                    : loadout.type === "Admin's Fav"
                    ? "admin-fav"
                    : loadout.type === "System Verified"
                    ? "system"
                    : "community"
                }
              >
                {tag}
              </Badge>
            ))}
        </div>
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReact(loadout, "like");
            }}
            className={`p-1.5 sm:px-2 rounded-full flex items-center transition-all active:scale-95 ${
              hasLiked
                ? "text-emerald-400 bg-emerald-500/20"
                : "text-gray-400 hover:text-emerald-400 hover:bg-white/10"
            }`}
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                hasLiked ? "fill-current" : ""
              }`}
            />
            {likeCount > 0 && (
              <span className="text-[10px] sm:text-xs font-bold ml-1.5">
                {likeCount}
              </span>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReact(loadout, "dislike");
            }}
            className={`p-1.5 sm:px-2 rounded-full flex items-center transition-all active:scale-95 ${
              hasDisliked
                ? "text-rose-400 bg-rose-500/20"
                : "text-gray-400 hover:text-rose-400 hover:bg-white/10"
            }`}
          >
            <ThumbsDown
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                hasDisliked ? "fill-current" : ""
              }`}
            />
            {dislikeCount > 0 && (
              <span className="text-[10px] sm:text-xs font-bold ml-1.5">
                {dislikeCount}
              </span>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReact(loadout, "heart");
            }}
            className={`p-1.5 sm:px-2 rounded-full flex items-center transition-all active:scale-95 ${
              hasHearted
                ? "text-pink-400 bg-pink-500/20"
                : "text-gray-400 hover:text-pink-400 hover:bg-white/10"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                hasHearted ? "fill-current" : ""
              }`}
            />
            {heartCount > 0 && (
              <span className="text-[10px] sm:text-xs font-bold ml-1.5">
                {heartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const FeedView = ({
  loadouts,
  title,
  subtitle,
  emptyMessage,
  currentUser,
  onReact,
  isAdmin,
  onDelete,
  onEdit,
  customDb,
  onReport,
  announcements,
  onPostAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("Hot");
  const [displayLimit, setDisplayLimit] = useState(20);
  const [expandedLoadout, setExpandedLoadout] = useState(null);
  const [announcementText, setAnnouncementText] = useState("");
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
  const [sortedIds, setSortedIds] = useState([]);
  const loadoutsRef = useRef(loadouts);
  const timeoutRef = useRef(null);

  const observer = useRef(null);
  const loadMoreRef = React.useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (!timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
              setDisplayLimit((prev) => prev + 20);
              timeoutRef.current = null;
            }, 500); // 500ms visual delay so the user can see the loading spinner
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px 50px 0px" }
    );
    if (node) observer.current.observe(node);
  }, []);

  const allAvailableTags = [
    ...new Set(loadouts.flatMap((l) => l.tags || [])),
  ].sort();
  const availableFilters = [
    "All",
    "Admin's Fav",
    "System Verified",
    "Pro Builds",
    "Community",
  ];
  if (currentUser) availableFilters.push("My Builds");
  if (isAdmin) availableFilters.push("Reported");

  useEffect(() => {
    loadoutsRef.current = loadouts;
  }, [loadouts]);
  useEffect(() => {
    setDisplayLimit(20);
  }, [filter, searchTerm, selectedTags, sortBy]);

  const handlePostAnnouncement = async () => {
    if (!announcementText.trim()) return;
    setIsPostingAnnouncement(true);
    await onPostAnnouncement(announcementText);
    setAnnouncementText("");
    setIsPostingAnnouncement(false);
  };

  const loadoutIdsString = loadouts.map((l) => l.id).join(",");

  useEffect(() => {
    const filtered = loadoutsRef.current
      .filter((l) => {
        if (filter === "Admin's Fav" && !l.isAdminFav) return false;
        if (filter === "System Verified" && l.type !== "System Verified")
          return false;
        if (filter === "Pro Builds" && l.type !== "Pro Build") return false;
        if (filter === "Community" && l.type !== "Community") return false;
        if (filter === "My Builds" && l.userId !== currentUser?.uid)
          return false;
        if (
          filter === "Reported" &&
          (!l.reportedBy || l.reportedBy.length === 0)
        )
          return false;
        if (
          selectedTags.length > 0 &&
          (!l.tags || !selectedTags.every((t) => l.tags.includes(t)))
        )
          return false;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchWeapon = l.weapon.toLowerCase().includes(term);
          const matchClass = l.class.toLowerCase().includes(term);
          const matchAuthor = (l.authorName || "").toLowerCase().includes(term);
          const matchTags = l.tags?.some((tag) =>
            tag.toLowerCase().includes(term)
          );
          if (!matchWeapon && !matchClass && !matchAuthor && !matchTags)
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Hot") {
          const scoreA =
            (a.likedBy?.length || 0) +
            (a.heartedBy?.length || 0) -
            (a.dislikedBy?.length || 0);
          const scoreB =
            (b.likedBy?.length || 0) +
            (b.heartedBy?.length || 0) -
            (b.dislikedBy?.length || 0);
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.timestamp - a.timestamp;
        }
        if (sortBy === "Newest") return b.timestamp - a.timestamp;
        if (sortBy === "Oldest") return a.timestamp - b.timestamp;
        if (sortBy === "Most Loved")
          return (b.heartedBy?.length || 0) - (a.heartedBy?.length || 0);
        if (sortBy === "Most Liked")
          return (b.likedBy?.length || 0) - (a.likedBy?.length || 0);
        if (sortBy === "Most Disliked")
          return (b.dislikedBy?.length || 0) - (a.dislikedBy?.length || 0);
        return b.timestamp - a.timestamp;
      });
    setSortedIds(filtered.map((l) => l.id));
  }, [loadoutIdsString, filter, searchTerm, selectedTags, sortBy]);

  const displayedLoadouts = sortedIds
    .map((id) => loadouts.find((l) => l.id === id))
    .filter(Boolean)
    .slice(0, displayLimit);

  const currentExpandedLoadout = expandedLoadout
    ? loadouts.find((l) => l.id === expandedLoadout.id)
    : null;

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3">
        {isAdmin && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-[20px] flex items-center gap-3 backdrop-blur-md relative z-20">
            <Megaphone className="w-5 h-5 text-indigo-400 shrink-0 ml-2" />
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Broadcast an announcement..."
              className="flex-grow bg-transparent text-white outline-none text-[15px] placeholder:text-indigo-400/50"
              onKeyDown={(e) => e.key === "Enter" && handlePostAnnouncement()}
            />
            <button
              onClick={handlePostAnnouncement}
              disabled={isPostingAnnouncement || !announcementText.trim()}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm"
            >
              {isPostingAnnouncement ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Post
                </span>
              )}
            </button>
          </div>
        )}
        {announcements && announcements.length > 0 && (
          <div className="flex flex-col gap-2 relative z-20">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="group flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-3 sm:px-5 sm:py-3.5 rounded-[20px] backdrop-blur-md shadow-lg animate-in slide-in-from-top-2 duration-300"
              >
                <div className="flex items-center gap-3 sm:gap-4 pr-4">
                  <div className="p-2 bg-amber-500/20 rounded-full shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  </div>
                  <p className="text-amber-100 text-sm sm:text-[15px] font-medium tracking-wide">
                    {announcement.text}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => onDeleteAnnouncement(announcement.id)}
                    className="p-2 text-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-all shrink-0 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 mt-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
            {title}
          </h2>
          <p className="text-gray-400 mt-2">{subtitle}</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-3 sm:p-4 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col gap-3.5 relative z-20">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search weapons, tags, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full min-h-[52px] bg-black/40 backdrop-blur-xl border border-white/5 text-white rounded-[20px] pl-12 pr-4 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300 text-[15px] placeholder:text-gray-600 shadow-inner"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex items-center gap-2 bg-black/40 border border-white/5 rounded-[22px] pl-4 pr-2 shadow-inner shrink-0 h-[52px]">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-white text-[14px] font-semibold outline-none w-full cursor-pointer appearance-none pr-6"
                >
                  <option value="Hot" className="bg-[#151517]">
                    🔥 Hot
                  </option>
                  <option value="Newest" className="bg-[#151517]">
                    🕒 Newest
                  </option>
                  <option value="Oldest" className="bg-[#151517]">
                    ⬇️ Oldest
                  </option>
                  <option value="Most Loved" className="bg-[#151517]">
                    ❤️ Most Loved
                  </option>
                  <option value="Most Liked" className="bg-[#151517]">
                    👍 Most Liked
                  </option>
                  <option value="Most Disliked" className="bg-[#151517]">
                    👎 Most Disliked
                  </option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-4 pointer-events-none" />
              </div>
              <div className="flex p-1.5 bg-black/40 border border-white/5 rounded-[22px] shadow-inner overflow-x-auto scrollbar-hide h-[52px] items-center">
                {availableFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-[16px] text-[14px] font-semibold whitespace-nowrap transition-all duration-500 ${
                      filter === f
                        ? f === "Reported"
                          ? "bg-rose-500/20 text-rose-400 shadow-[0_2px_10px_rgba(225,29,72,0.3)]"
                          : f === "Admin's Fav"
                          ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_2px_10px_rgba(217,70,239,0.3)]"
                          : "bg-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)] scale-100"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5 scale-95 hover:scale-100"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {allAvailableTags.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-1 px-2 items-center">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1 mr-2 shrink-0">
                Tags
              </span>
              <Badge
                active={selectedTags.length === 0}
                onClick={() => setSelectedTags([])}
              >
                All
              </Badge>
              {allAvailableTags.map((tag) => (
                <Badge
                  key={tag}
                  active={selectedTags.includes(tag)}
                  onClick={() => {
                    if (selectedTags.includes(tag))
                      setSelectedTags(selectedTags.filter((t) => t !== tag));
                    else setSelectedTags([...selectedTags, tag]);
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {sortedIds.length === 0 ? (
        <div className="py-20 text-center border border-white/5 border-dashed rounded-3xl bg-white/[0.02]">
          <Compass className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300">No matches found</h3>
          <p className="text-gray-500 mt-2">{emptyMessage}</p>
        </div>
      ) : (
        <React.Fragment>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedLoadouts.map((loadout) => (
              <LoadoutCard
                key={loadout.id}
                loadout={loadout}
                currentUser={currentUser}
                onReact={onReact}
                isAdmin={isAdmin}
                onDelete={onDelete}
                onEdit={onEdit}
                onReport={onReport}
                onExpand={() => setExpandedLoadout(loadout)}
              />
            ))}
          </div>
          {sortedIds.length > displayLimit && (
            <div ref={loadMoreRef} className="py-10 flex justify-center w-full">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-gray-400">
                  Loading more...
                </span>
              </div>
            </div>
          )}
        </React.Fragment>
      )}
      {currentExpandedLoadout && (
        <ExpandedLoadoutModal
          loadout={currentExpandedLoadout}
          onClose={() => setExpandedLoadout(null)}
          currentUser={currentUser}
          onReact={onReact}
          isAdmin={isAdmin}
          onDelete={(id) => {
            setExpandedLoadout(null);
            onDelete(id);
          }}
          onEdit={(loadout) => {
            setExpandedLoadout(null);
            onEdit(loadout);
          }}
          onReport={onReport}
        />
      )}
    </div>
  );
};

const MetaTierView = ({ loadouts }) => {
  const { aggregatedStats } = React.useMemo(() => {
    const stats = {};
    loadouts.forEach((loadout) => {
      if (!stats[loadout.weapon]) {
        stats[loadout.weapon] = {
          name: loadout.weapon,
          score: 0,
          buildCount: 0,
        };
      }
      const score =
        (loadout.likedBy?.length || 0) +
        (loadout.heartedBy?.length || 0) -
        (loadout.dislikedBy?.length || 0);
      stats[loadout.weapon].score += score;
      stats[loadout.weapon].buildCount += 1;
    });

    const sortedStats = Object.values(stats)
      .sort((a, b) =>
        b.score !== a.score ? b.score - a.score : b.buildCount - a.buildCount
      )
      .slice(0, 10);

    return { aggregatedStats: sortedStats };
  }, [loadouts]);

  const tiers = [
    {
      name: "S-Tier",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      desc: "Absolute Meta. The top guns across all community builds.",
      weapons: aggregatedStats.slice(0, 2).map((w) => w.name),
    },
    {
      name: "A-Tier",
      color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
      desc: "Highly Competitive. Consistently upvoted and reliable.",
      weapons: aggregatedStats.slice(2, 5).map((w) => w.name),
    },
    {
      name: "B-Tier",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      desc: "Balanced. Strong performance with the right loadout.",
      weapons: aggregatedStats.slice(5, 8).map((w) => w.name),
    },
    {
      name: "C-Tier",
      color: "text-gray-400 bg-white/5 border-white/10",
      desc: "Viable. Solid performers rounding out the top 10.",
      weapons: aggregatedStats.slice(8, 10).map((w) => w.name),
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
          <Trophy className="w-10 h-10 text-amber-400 drop-shadow-md" />
        </div>
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight drop-shadow-sm">
          Meta Tier List
        </h2>
        <p className="text-gray-400 text-lg">
          Dynamically ranked top 10 weapons based on community upvotes and
          performance.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {tiers.map((tier, idx) => (
          <div
            key={tier.name}
            className="bg-[#121214]/85 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden group hover:border-white/20 transition-colors"
          >
            <div
              className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none -translate-y-1/2 translate-x-1/3 ${
                idx === 0
                  ? "bg-rose-500"
                  : idx === 1
                  ? "bg-orange-500"
                  : idx === 2
                  ? "bg-emerald-500"
                  : "bg-gray-500"
              }`}
            ></div>
            <div
              className={`flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] border flex items-center justify-center font-black text-4xl sm:text-5xl shadow-inner relative z-10 ${tier.color}`}
            >
              {tier.name[0]}
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {tier.name} Weapons
              </h3>
              <p className="text-sm text-gray-400 mb-5">{tier.desc}</p>
              <div className="flex flex-wrap gap-2.5">
                {tier.weapons.length > 0 ? (
                  tier.weapons.map((w) => (
                    <span
                      key={w}
                      className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl text-sm font-bold text-gray-200 shadow-sm flex items-center gap-2"
                    >
                      <Crosshair className="w-3.5 h-3.5 opacity-50" /> {w}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-semibold text-gray-600 italic px-2">
                    Gathering data...
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SubmitView = ({ user, isAdmin, customDb }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState("");
  const [attachments, setAttachments] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminFav, setIsAdminFav] = useState(false);
  const [success, setSuccess] = useState(false);
  const [postType, setPostType] = useState("Community");
  const [authorName, setAuthorName] = useState("");
  const allClasses = getAllClasses(customDb);
  const availableWeapons = selectedClass
    ? getAllWeapons(selectedClass, customDb)
    : [];

  const handleAttachmentChange = (category, value) => {
    const newAttachments = { ...attachments };
    if (!value) delete newAttachments[category];
    else newAttachments[category] = value;
    setAttachments(newAttachments);
  };
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag))
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    else if (selectedTags.length < 4) setSelectedTags([...selectedTags, tag]);
  };
  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const tag = customTag.trim();
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 4)
      setSelectedTags([...selectedTags, tag]);
    setCustomTag("");
  };
  const handleSubmit = async () => {
    if (!selectedWeapon) return;
    setIsSubmitting(true);
    try {
      const loadoutsRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "loadouts"
      );
      await addDoc(loadoutsRef, {
        weapon: selectedWeapon,
        class: selectedClass,
        attachments,
        tags: selectedTags,
        type: isAdmin ? postType : "Community",
        isAdminFav: isAdmin ? isAdminFav : false,
        authorName: authorName.trim()
          ? authorName.trim()
          : isAdmin
          ? "System"
          : "Anonymous",
        userId: user?.uid || "anonymous",
        timestamp: Date.now(),
        likedBy: [],
        dislikedBy: [],
        heartedBy: [],
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedClass("");
        setSelectedWeapon("");
        setAttachments({});
        setSelectedTags([]);
        setAuthorName("");
        setPostType("Community");
        setIsAdminFav(false);
      }, 2000);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };
  const attachmentCount = Object.keys(attachments).length;

  if (success)
    return (
      <div className="w-full max-w-2xl mx-auto py-20 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-3">
          Loadout Deployed!
        </h2>
        <p className="text-gray-400 text-lg">
          Your build is now live on the Discovery feed.
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-2xl flex flex-col gap-8 pb-32 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white mb-2">
          Create Loadout
        </h2>
        <p className="text-gray-400">
          Share your best setup (up to 5 attachments) with the community.
        </p>
      </div>
      {isAdmin && (
        <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[24px]">
          <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Admin Controls
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 block">
                Post Type
              </label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 text-base outline-none border border-indigo-500/30 focus:border-indigo-500/60 mb-4"
              >
                <option value="Community">Community</option>
                <option value="System Verified">System Verified</option>
                <option value="Pro Build">Pro Build</option>
              </select>
              <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-fuchsia-500/20">
                <div className="flex items-center gap-2">
                  <Bookmark
                    className={`w-4 h-4 ${
                      isAdminFav
                        ? "text-fuchsia-400 fill-current"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-bold ${
                      isAdminFav ? "text-fuchsia-300" : "text-gray-400"
                    }`}
                  >
                    Admin's Pick
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminFav(!isAdminFav)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    isAdminFav
                      ? "bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.4)]"
                      : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      isAdminFav ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 block">
                {postType === "Pro Build" ? "Pro Player Name" : "Author Name"}
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={postType === "Pro Build" ? "e.g. iFerg" : "System"}
                className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 text-base outline-none border border-indigo-500/30 focus:border-indigo-500/60 transition-all placeholder:text-gray-600"
                maxLength={25}
              />
            </div>
          </div>
        </div>
      )}
      <div className="bg-[#121214] border border-white/10 p-6 sm:p-8 rounded-[32px] shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h3 className="text-xl font-bold">Core Weapon</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="relative">
            <label className="absolute left-3 -top-2.5 bg-[#121214] px-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 z-10 rounded-sm">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedWeapon("");
                setAttachments({});
              }}
              className="w-full bg-[#151517] text-white appearance-none text-base rounded-xl pl-4 pr-10 py-3.5 outline-none border border-white/10 focus:border-white/30 transition-all cursor-pointer"
            >
              <option value="">Choose Class</option>
              {allClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <label className="absolute left-3 -top-2.5 bg-[#121214] px-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 z-10 rounded-sm">
              Weapon
            </label>
            <select
              value={selectedWeapon}
              onChange={(e) => {
                setSelectedWeapon(e.target.value);
                setAttachments({});
              }}
              disabled={!selectedClass}
              className="w-full bg-[#151517] text-white appearance-none text-base rounded-xl pl-4 pr-10 py-3.5 outline-none border border-white/10 focus:border-white/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <option value="">Choose Weapon</option>
              {availableWeapons.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
      <div
        className={`bg-[#121214] border border-white/10 p-6 sm:p-8 rounded-[32px] shadow-2xl transition-all duration-300 ${
          !selectedWeapon ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="text-xl font-bold">Gunsmith</h3>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < attachmentCount ? "bg-white" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
          {ATTACHMENT_CATEGORIES.map((category) => {
            const options = getOptionsForCategory(
              selectedWeapon,
              selectedClass,
              category,
              customDb
            );
            const isSelected = !!attachments[category];
            const isDisabled = attachmentCount >= 5 && !isSelected;
            return (
              <div key={category} className="relative">
                <label
                  className={`absolute left-3 -top-2.5 bg-[#121214] px-1.5 text-[10px] font-bold uppercase tracking-widest z-10 rounded-sm transition-colors ${
                    isSelected ? "text-indigo-400" : "text-gray-500"
                  }`}
                >
                  {category}
                </label>
                <select
                  value={attachments[category] || ""}
                  onChange={(e) =>
                    handleAttachmentChange(category, e.target.value)
                  }
                  disabled={isDisabled}
                  className={`w-full bg-[#151517] text-white appearance-none text-base rounded-xl pl-4 pr-10 py-3.5 outline-none border transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-500/50 bg-indigo-500/[0.02]"
                      : "border-white/10 focus:border-white/30"
                  } ${
                    isDisabled
                      ? "opacity-50"
                      : "focus:ring-1 focus:ring-white/20"
                  }`}
                >
                  <option value="">None</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                    isSelected ? "text-indigo-400" : "text-gray-500"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div
        className={`bg-[#121214] border border-white/10 p-6 sm:p-8 rounded-[32px] shadow-2xl transition-all duration-300 ${
          !selectedWeapon ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
            3
          </div>
          <h3 className="text-xl font-bold">
            Playstyle Tags{" "}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({selectedTags.length}/4)
            </span>
          </h3>
        </div>
        <div className="flex flex-wrap gap-2.5 mb-8">
          {PLAYSTYLE_TAGS.map((tag) => (
            <Badge
              key={tag}
              active={selectedTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags
            .filter((t) => !PLAYSTYLE_TAGS.includes(t))
            .map((tag) => (
              <Badge key={tag} active={true} onClick={() => toggleTag(tag)}>
                {tag}
              </Badge>
            ))}
        </div>
        {isAdmin && (
          <div className="flex gap-2 mb-8">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomTag(e)}
              placeholder="Admin Custom Tag (e.g. Meta Sept 2026)"
              className="flex-1 bg-[#151517] text-white rounded-xl px-4 py-3 text-base outline-none border border-white/10 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
            />
            <button
              onClick={handleAddCustomTag}
              className="px-6 bg-indigo-500/20 text-indigo-400 font-bold rounded-xl border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
            >
              Add Tag
            </button>
          </div>
        )}
        {!isAdmin && (
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
              Your Gaming Name (Optional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Ghost, Soap, etc."
              className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 text-base outline-none border border-white/10 focus:border-white/30 transition-all placeholder:text-gray-600"
              maxLength={25}
            />
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedWeapon}
          className="w-full bg-white text-black font-bold py-4 rounded-xl text-[15px] hover:bg-gray-200 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span>Deploy Loadout</span>
          )}
        </button>
      </div>
    </div>
  );
};

const ReportModal = ({ loadout, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    await onSubmit(loadout, reason.trim());
    setIsSubmitting(false);
  };
  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#121214] border border-white/10 rounded-[24px] shadow-2xl max-w-sm w-full flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-amber-500/10">
          <div className="flex items-center gap-3">
            <Flag className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Report Build
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-400 mb-4">
            Please provide a reason for reporting{" "}
            <strong className="text-white">{loadout.weapon}</strong>.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for reporting (e.g., spam, fake build)..."
            className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 border border-white/5 outline-none focus:border-amber-500/50 custom-scrollbar resize-none h-32"
            autoFocus
          />
        </div>
        <div className="p-5 border-t border-white/10 flex gap-3 bg-[#151517]">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 py-3 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/20 font-bold hover:bg-amber-500/30 disabled:opacity-50 transition-colors flex justify-center items-center"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Submit Report"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ loadout, onClose, onSave, customDb, isAdmin }) => {
  const [editClass, setEditClass] = useState(loadout.class);
  const [editWeapon, setEditWeapon] = useState(loadout.weapon);
  const [attachments, setAttachments] = useState(loadout.attachments || {});
  const [selectedTags, setSelectedTags] = useState(loadout.tags || []);
  const [customTag, setCustomTag] = useState("");
  const [type, setType] = useState(loadout.type || "Community");
  const [isAdminFav, setIsAdminFav] = useState(loadout.isAdminFav || false);
  const [isLocked, setIsLocked] = useState(loadout.isLocked || false);
  const [authorName, setAuthorName] = useState(loadout.authorName || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleAttachmentChange = (category, value) => {
    const newAttachments = { ...attachments };
    if (!value.trim()) delete newAttachments[category];
    else newAttachments[category] = value;
    setAttachments(newAttachments);
  };
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag))
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  };
  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const tag = customTag.trim();
    if (tag && !selectedTags.includes(tag))
      setSelectedTags([...selectedTags, tag]);
    setCustomTag("");
  };
  const handleSave = async () => {
    setIsSaving(true);
    await onSave(loadout.id, {
      class: editClass,
      weapon: editWeapon,
      attachments,
      tags: selectedTags,
      type,
      isAdminFav,
      isLocked,
      authorName: authorName.trim()
        ? authorName.trim()
        : isAdmin
        ? "System"
        : "Anonymous",
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#121214] border border-white/10 rounded-[24px] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-[24px]">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Edit Loadout
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {loadout.weapon} ({loadout.class})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6 custom-scrollbar">
          {isAdmin && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Super Admin Controls
                </label>
                {loadout.reportedBy?.length > 0 && (
                  <button
                    onClick={async () => {
                      await onSave(loadout.id, {
                        reportedBy: [],
                        reportDetails: [],
                      });
                      onClose();
                    }}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-lg hover:bg-emerald-500/30 transition-all border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    Clear User Reports
                  </button>
                )}
              </div>

              {loadout.reportDetails?.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                    User Report Reasons ({loadout.reportDetails.length}):
                  </label>
                  {loadout.reportDetails.map((rep, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-rose-200 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20"
                    >
                      <span className="font-semibold opacity-75 mr-2">
                        Reason:
                      </span>
                      {rep.reason}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    value={editClass}
                    onChange={(e) => {
                      setEditClass(e.target.value);
                      setEditWeapon("");
                      setAttachments({});
                    }}
                    className="w-full bg-amber-500/10 text-amber-200 appearance-none text-sm font-bold rounded-xl pl-4 pr-10 py-3 outline-none border border-amber-500/30"
                  >
                    {getAllClasses(customDb).map((c) => (
                      <option key={c} value={c} className="bg-[#151517]">
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={editWeapon}
                    onChange={(e) => {
                      setEditWeapon(e.target.value);
                      setAttachments({});
                    }}
                    disabled={!editClass}
                    className="w-full bg-amber-500/10 text-amber-200 appearance-none text-sm font-bold rounded-xl pl-4 pr-10 py-3 outline-none border border-amber-500/30 disabled:opacity-50"
                  >
                    <option value="">Select Weapon</option>
                    {editClass &&
                      getAllWeapons(editClass, customDb).map((w) => (
                        <option key={w} value={w} className="bg-[#151517]">
                          {w}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20 mb-2">
                {["Community", "System Verified", "Pro Build"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 text-sm font-semibold py-2 px-2 rounded-lg transition-all whitespace-nowrap ${
                      type === t
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-indigo-300 hover:bg-indigo-500/20"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-fuchsia-500/20">
                <div className="flex items-center gap-2">
                  <Bookmark
                    className={`w-5 h-5 ${
                      isAdminFav
                        ? "text-fuchsia-400 fill-current"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-bold ${
                      isAdminFav ? "text-fuchsia-300" : "text-gray-400"
                    }`}
                  >
                    Mark as Admin's Pick
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminFav(!isAdminFav)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    isAdminFav
                      ? "bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.4)]"
                      : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      isAdminFav ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-rose-500/20">
                <div className="flex items-center gap-2">
                  <Lock
                    className={`w-5 h-5 ${
                      isLocked ? "text-rose-400 fill-current" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-bold ${
                      isLocked ? "text-rose-300" : "text-gray-400"
                    }`}
                  >
                    Lock Loadout
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocked(!isLocked)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    isLocked
                      ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                      : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      isLocked ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex-1 mt-2">
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-[#151517] text-white rounded-lg px-3 py-2 text-sm outline-none border border-white/5"
                  placeholder="System"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">
              Attachments ({Object.keys(attachments).length}/5)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ATTACHMENT_CATEGORIES.map((cat) => (
                <div key={cat} className="relative">
                  <label className="absolute left-3 -top-2.5 bg-[#151517] px-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 z-10 rounded-sm">
                    {cat}
                  </label>
                  <select
                    value={attachments[cat] || ""}
                    onChange={(e) =>
                      handleAttachmentChange(cat, e.target.value)
                    }
                    className="w-full bg-[#151517] text-white appearance-none text-base rounded-xl pl-4 pr-10 py-3 outline-none border border-white/5 focus:border-white/20 transition-all"
                  >
                    <option value="">None</option>
                    {getOptionsForCategory(
                      editWeapon,
                      editClass,
                      cat,
                      customDb
                    ).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {[...new Set([...PLAYSTYLE_TAGS, ...selectedTags])].map((tag) => (
                <Badge
                  key={tag}
                  active={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomTag(e)}
                  placeholder="Add Custom Tag..."
                  className="flex-1 bg-[#151517] text-white rounded-lg px-3 py-2 text-sm outline-none border border-white/10"
                />
                <button
                  onClick={handleAddCustomTag}
                  className="px-3 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-bold border border-indigo-500/30"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-[#151517] rounded-b-[24px]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center min-w-[100px]"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DbManagerModal = ({ customDb, appInfo, loadouts, onClose }) => {
  const [tab, setTab] = useState("weapon");
  const [isNewClass, setIsNewClass] = useState(false);
  const [weaponClass, setWeaponClass] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [weaponName, setWeaponName] = useState("");
  const [cloneWeapon, setCloneWeapon] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [targetGun, setTargetGun] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [removeType, setRemoveType] = useState("weapon");
  const [removeTargetClass, setRemoveTargetClass] = useState("");
  const [removeTargetWeapon, setRemoveTargetWeapon] = useState("");
  const [removeTargetCategory, setRemoveTargetCategory] = useState("");
  const [removeTargetAttachment, setRemoveTargetAttachment] = useState("");
  const [newAppVersion, setNewAppVersion] = useState(
    appInfo?.version || APP_VERSION
  );
  const [clDate, setClDate] = useState("");
  const [clTitle, setClTitle] = useState("");
  const [clChanges, setClChanges] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const allClasses = getAllClasses(customDb);
  const allWeaponsFlat = allClasses
    .flatMap((c) => getAllWeapons(c, customDb))
    .sort();
  const reportedLoadouts = (loadouts || []).filter(
    (l) => l.reportDetails && l.reportDetails.length > 0
  );

  const handleClearReports = async (id) => {
    try {
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "loadouts",
        id
      );
      if (id.startsWith("sys-") || id.startsWith("pro-")) {
        const original = SYSTEM_TEMPLATES.find((t) => t.id === id);
        await setDoc(
          docRef,
          { ...original, reportedBy: [], reportDetails: [] },
          { merge: true }
        );
      } else {
        await updateDoc(docRef, { reportedBy: [], reportDetails: [] });
      }
    } catch (e) {}
  };

  const handleDeleteLoadout = async (id) => {
    try {
      if (id.startsWith("sys-") || id.startsWith("pro-")) {
        await setDoc(
          doc(db, "artifacts", appId, "public", "data", "loadouts", id),
          { deleted: true },
          { merge: true }
        );
      } else {
        await deleteDoc(
          doc(db, "artifacts", appId, "public", "data", "loadouts", id)
        );
      }
    } catch (e) {}
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    if (tab === "version") {
      if (!newAppVersion.trim()) {
        setIsSaving(false);
        return setMessage("Version required");
      }
      const newChangelogItem = {
        version: newAppVersion.trim(),
        date:
          clDate.trim() ||
          new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
        title: clTitle.trim() || "Minor Update",
        changes: clChanges.trim()
          ? clChanges.split("\n").filter((c) => c.trim())
          : ["General improvements and bug fixes."],
      };

      const updatedAppInfo = {
        version: newAppVersion.trim(),
        changelog: [
          newChangelogItem,
          ...(appInfo?.changelog || CHANGELOG_ITEMS),
        ],
      };

      try {
        await setDoc(
          doc(db, "artifacts", appId, "public", "data", "config", "app_info"),
          updatedAppInfo,
          { merge: true }
        );
        setMessage("Version updated!");
        setTimeout(() => {
          setMessage("");
          setIsSaving(false);
          setClTitle("");
          setClChanges("");
        }, 1500);
      } catch (e) {
        setMessage("Error saving.");
        setIsSaving(false);
      }
      return;
    }

    const updatedDb = JSON.parse(
      JSON.stringify(customDb || { weapons: {}, overrides: {} })
    );
    if (!updatedDb.weapons) updatedDb.weapons = {};
    if (!updatedDb.overrides) updatedDb.overrides = {};
    if (!updatedDb.hidden)
      updatedDb.hidden = { classes: [], weapons: [], attachments: {} };

    if (tab === "weapon") {
      const finalClass = isNewClass ? newClassName.trim() : weaponClass;
      if (!finalClass || !weaponName) {
        setIsSaving(false);
        return setMessage("Fill class and weapon name");
      }
      if (!updatedDb.weapons[finalClass]) updatedDb.weapons[finalClass] = [];
      if (!updatedDb.weapons[finalClass].includes(weaponName.trim()))
        updatedDb.weapons[finalClass].push(weaponName.trim());
      if (cloneWeapon) {
        const clonedOverrides = {};
        ATTACHMENT_CATEGORIES.forEach((cat) => {
          const combined = [
            ...new Set([
              ...(WEAPON_OVERRIDES[cloneWeapon]?.[cat] || []),
              ...(customDb?.overrides?.[cloneWeapon]?.[cat] || []),
            ]),
          ];
          if (combined.length > 0) clonedOverrides[cat] = combined;
        });
        if (Object.keys(clonedOverrides).length > 0)
          updatedDb.overrides[weaponName.trim()] = clonedOverrides;
      }
    } else if (tab === "attachment") {
      if (!targetGun || !targetCategory || !attachmentName) {
        setIsSaving(false);
        return setMessage("Fill all fields");
      }
      if (!updatedDb.overrides[targetGun]) updatedDb.overrides[targetGun] = {};
      if (!updatedDb.overrides[targetGun][targetCategory])
        updatedDb.overrides[targetGun][targetCategory] = [];
      if (
        !updatedDb.overrides[targetGun][targetCategory].includes(
          attachmentName.trim()
        )
      )
        updatedDb.overrides[targetGun][targetCategory].push(
          attachmentName.trim()
        );
    } else if (tab === "remove") {
      if (removeType === "weapon") {
        if (!removeTargetClass || !removeTargetWeapon) {
          setIsSaving(false);
          return setMessage("Select weapon to remove");
        }
        if (
          updatedDb.weapons[removeTargetClass] &&
          updatedDb.weapons[removeTargetClass].includes(removeTargetWeapon)
        )
          updatedDb.weapons[removeTargetClass] = updatedDb.weapons[
            removeTargetClass
          ].filter((w) => w !== removeTargetWeapon);
        else if (!updatedDb.hidden.weapons.includes(removeTargetWeapon))
          updatedDb.hidden.weapons.push(removeTargetWeapon);
      } else {
        if (
          !removeTargetWeapon ||
          !removeTargetCategory ||
          !removeTargetAttachment
        ) {
          setIsSaving(false);
          return setMessage("Select attachment to remove");
        }
        if (
          updatedDb.overrides[removeTargetWeapon]?.[removeTargetCategory] &&
          updatedDb.overrides[removeTargetWeapon][
            removeTargetCategory
          ].includes(removeTargetAttachment)
        ) {
          updatedDb.overrides[removeTargetWeapon][removeTargetCategory] =
            updatedDb.overrides[removeTargetWeapon][
              removeTargetCategory
            ].filter((a) => a !== removeTargetAttachment);
        } else {
          if (!updatedDb.hidden.attachments[removeTargetWeapon])
            updatedDb.hidden.attachments[removeTargetWeapon] = {};
          if (
            !updatedDb.hidden.attachments[removeTargetWeapon][
              removeTargetCategory
            ]
          )
            updatedDb.hidden.attachments[removeTargetWeapon][
              removeTargetCategory
            ] = [];
          if (
            !updatedDb.hidden.attachments[removeTargetWeapon][
              removeTargetCategory
            ].includes(removeTargetAttachment)
          )
            updatedDb.hidden.attachments[removeTargetWeapon][
              removeTargetCategory
            ].push(removeTargetAttachment);
        }
      }
    }
    try {
      const configRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "config",
        "weapon_schema"
      );
      await setDoc(configRef, updatedDb, { merge: true });
      setMessage("Successfully saved!");
      setTimeout(() => {
        setWeaponName("");
        setAttachmentName("");
        setMessage("");
        setIsSaving(false);
      }, 1500);
    } catch (e) {
      setMessage("Error saving.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#121214] border border-white/10 rounded-[24px] shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-indigo-500/10">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Database Manager
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setTab("weapon")}
              className={`flex-1 text-xs sm:text-sm font-semibold py-2 px-1 rounded-lg transition-all ${
                tab === "weapon"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              New Weapon
            </button>
            <button
              onClick={() => setTab("attachment")}
              className={`flex-1 text-xs sm:text-sm font-semibold py-2 px-1 rounded-lg transition-all ${
                tab === "attachment"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              New Attachment
            </button>
            <button
              onClick={() => setTab("remove")}
              className={`flex-1 text-xs sm:text-sm font-semibold py-2 px-1 rounded-lg transition-all ${
                tab === "remove"
                  ? "bg-rose-500 text-white shadow-md"
                  : "text-gray-400 hover:text-rose-200"
              }`}
            >
              Delete
            </button>
            <button
              onClick={() => setTab("version")}
              className={`flex-1 text-xs sm:text-sm font-semibold py-2 px-1 rounded-lg transition-all ${
                tab === "version"
                  ? "bg-amber-500 text-white shadow-md"
                  : "text-gray-400 hover:text-amber-200"
              }`}
            >
              Version
            </button>
            <button
              onClick={() => setTab("reports")}
              className={`flex-1 text-xs sm:text-sm font-semibold py-2 px-1 rounded-lg transition-all ${
                tab === "reports"
                  ? "bg-fuchsia-500 text-white shadow-md"
                  : "text-gray-400 hover:text-fuchsia-200"
              }`}
            >
              Reports{" "}
              {reportedLoadouts.length > 0 && `(${reportedLoadouts.length})`}
            </button>
          </div>
          {message && (
            <div className="text-sm font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-lg text-center">
              {message}
            </div>
          )}
          {tab === "weapon" && (
            <div className="flex flex-col gap-4">
              {!isNewClass ? (
                <div className="relative">
                  <select
                    value={weaponClass}
                    onChange={(e) => {
                      if (e.target.value === "__new__") setIsNewClass(true);
                      else setWeaponClass(e.target.value);
                    }}
                    className="w-full bg-[#151517] text-white rounded-xl pl-4 pr-10 py-3 border border-white/5 outline-none focus:border-white/20 appearance-none"
                  >
                    <option value="">Select Weapon Class</option>
                    {allClasses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option
                      value="__new__"
                      className="text-indigo-400 font-bold bg-indigo-500/10"
                    >
                      ➕ Create New Class...
                    </option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Custom Class (e.g., Pistols)"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="flex-1 bg-[#151517] text-white rounded-xl px-4 py-3 border border-white/5 outline-none focus:border-white/20"
                  />
                  <button
                    onClick={() => {
                      setIsNewClass(false);
                      setNewClassName("");
                      setWeaponClass("");
                    }}
                    className="px-4 bg-white/5 text-gray-400 hover:text-white rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                type="text"
                placeholder="Weapon Name (e.g., Kilo 141)"
                value={weaponName}
                onChange={(e) => setWeaponName(e.target.value)}
                className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 border border-white/5 outline-none focus:border-white/20"
              />
              <div className="relative">
                <select
                  value={cloneWeapon}
                  onChange={(e) => setCloneWeapon(e.target.value)}
                  className="w-full bg-indigo-500/5 text-indigo-200 rounded-xl pl-4 pr-10 py-3 border border-indigo-500/20 outline-none focus:border-indigo-500/40 appearance-none"
                >
                  <option value="">Copy attachments from... (Optional)</option>
                  {allWeaponsFlat.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50 pointer-events-none" />
              </div>
            </div>
          )}
          {tab === "attachment" && (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <select
                  value={targetClass}
                  onChange={(e) => {
                    setTargetClass(e.target.value);
                    setTargetGun("");
                  }}
                  className="w-full bg-[#151517] text-white rounded-xl pl-4 pr-10 py-3 border border-white/5 outline-none appearance-none"
                >
                  <option value="">Select Class</option>
                  {allClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={targetGun}
                  onChange={(e) => setTargetGun(e.target.value)}
                  disabled={!targetClass}
                  className="w-full bg-[#151517] text-white rounded-xl pl-4 pr-10 py-3 border border-white/5 outline-none appearance-none"
                >
                  <option value="">Select Weapon</option>
                  {targetClass &&
                    getAllWeapons(targetClass, customDb).map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full bg-[#151517] text-white rounded-xl pl-4 pr-10 py-3 border border-white/5 outline-none appearance-none"
                >
                  <option value="">Select Attachment Category</option>
                  {ATTACHMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                placeholder="Attachment Name (e.g., Task Force Barrel)"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 border border-white/5 outline-none focus:border-white/20"
              />
            </div>
          )}
          {tab === "remove" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex gap-2 bg-rose-500/10 p-1 rounded-xl mb-2">
                <button
                  onClick={() => setRemoveType("weapon")}
                  className={`flex-1 text-xs sm:text-sm font-semibold py-2 rounded-lg transition-all ${
                    removeType === "weapon"
                      ? "bg-rose-500 text-white shadow-md"
                      : "text-rose-300 hover:text-rose-200"
                  }`}
                >
                  Remove Weapon
                </button>
                <button
                  onClick={() => setRemoveType("attachment")}
                  className={`flex-1 text-xs sm:text-sm font-semibold py-2 rounded-lg transition-all ${
                    removeType === "attachment"
                      ? "bg-rose-500 text-white shadow-md"
                      : "text-rose-300 hover:text-rose-200"
                  }`}
                >
                  Remove Attachment
                </button>
              </div>
              {removeType === "weapon" ? (
                <>
                  <div className="relative">
                    <select
                      value={removeTargetClass}
                      onChange={(e) => {
                        setRemoveTargetClass(e.target.value);
                        setRemoveTargetWeapon("");
                      }}
                      className="w-full bg-[#151517] text-white rounded-xl pl-4 pr-10 py-3 border border-white/5 outline-none appearance-none"
                    >
                      <option value="">Select Class...</option>
                      {allClasses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={removeTargetWeapon}
                      onChange={(e) => setRemoveTargetWeapon(e.target.value)}
                      disabled={!removeTargetClass}
                      className="w-full bg-[#151517] text-white rounded-xl pl-4 pr-10 py-3 border border-white/5 outline-none appearance-none"
                    >
                      <option value="">Select Weapon to Delete...</option>
                      {removeTargetClass &&
                        getAllWeapons(removeTargetClass, customDb).map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <select
                      value={removeTargetWeapon}
                      onChange={(e) => {
                        setRemoveTargetWeapon(e.target.value);
                        setRemoveTargetCategory("");
                        setRemoveTargetAttachment("");
                      }}
                      className="w-full bg-[#151517] text-white rounded-xl pl-4 pr-10 py-3 border border-white/5 outline-none appearance-none"
                    >
                      <option value="">Select Weapon...</option>
                      {allWeaponsFlat.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={removeTargetCategory}
                      onChange={(e) => {
                        setRemoveTargetCategory(e.target.value);
                        setRemoveTargetAttachment("");
                      }}
                      disabled={!removeTargetWeapon}
                      className="w-full bg-[#151517] text-white rounded-xl pl-4 pr-10 py-3 border border-white/5 outline-none appearance-none"
                    >
                      <option value="">Select Category...</option>
                      {ATTACHMENT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={removeTargetAttachment}
                      onChange={(e) =>
                        setRemoveTargetAttachment(e.target.value)
                      }
                      disabled={!removeTargetCategory}
                      className="w-full bg-[#151517] text-white rounded-xl pl-4 pr-10 py-3 border border-white/5 outline-none appearance-none"
                    >
                      <option value="">Select Attachment to Delete...</option>
                      {removeTargetWeapon &&
                        removeTargetCategory &&
                        getOptionsForCategory(
                          removeTargetWeapon,
                          allClasses.find((c) =>
                            getAllWeapons(c, customDb).includes(
                              removeTargetWeapon
                            )
                          ),
                          removeTargetCategory,
                          customDb
                        ).map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </>
              )}
            </div>
          )}
          {tab === "version" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <input
                type="text"
                placeholder="New Version (e.g. v1.3.0)"
                value={newAppVersion}
                onChange={(e) => setNewAppVersion(e.target.value)}
                className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 border border-white/5 outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Date (e.g. October 2026)"
                value={clDate}
                onChange={(e) => setClDate(e.target.value)}
                className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 border border-white/5 outline-none focus:border-amber-500/50"
              />
              <input
                type="text"
                placeholder="Update Title (e.g. New Weapons Added)"
                value={clTitle}
                onChange={(e) => setClTitle(e.target.value)}
                className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 border border-white/5 outline-none focus:border-amber-500/50"
              />
              <textarea
                placeholder="Changes (One per line)"
                value={clChanges}
                onChange={(e) => setClChanges(e.target.value)}
                rows={4}
                className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 border border-white/5 outline-none focus:border-amber-500/50 custom-scrollbar resize-none"
              />
            </div>
          )}
          {tab === "reports" && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {reportedLoadouts.length === 0 ? (
                <div className="text-center py-10 border border-white/5 border-dashed rounded-2xl bg-white/[0.02]">
                  <Flag className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-300">
                    No Reports
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Community is quiet and peaceful.
                  </p>
                </div>
              ) : (
                reportedLoadouts.map((loadout) => (
                  <div
                    key={loadout.id}
                    className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/20 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <h4 className="text-white font-bold text-lg leading-tight">
                          {loadout.weapon}{" "}
                          <span className="text-rose-400 text-xs font-bold uppercase tracking-wider ml-1">
                            ({loadout.class})
                          </span>
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          By {loadout.authorName || "Anonymous"}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {confirmDeleteId === loadout.id ? (
                          <React.Fragment>
                            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mr-1">
                              Confirm?
                            </span>
                            <button
                              onClick={() => {
                                handleDeleteLoadout(loadout.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-3 py-1.5 bg-rose-500 text-white border border-rose-600 hover:bg-rose-600 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-lg"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-bold transition-all active:scale-95"
                            >
                              No
                            </button>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <button
                              onClick={() => handleClearReports(loadout.id)}
                              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
                            >
                              Clear
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(loadout.id)}
                              className="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
                            >
                              Delete
                            </button>
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                    <div className="bg-[#121214] rounded-lg p-3 max-h-32 overflow-y-auto custom-scrollbar border border-white/5 relative z-10">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                        <Flag className="w-3 h-3 text-rose-400" /> Report
                        Reasons:
                      </h5>
                      <ul className="flex flex-col gap-1.5">
                        {loadout.reportDetails.map((rep, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-300 bg-white/5 px-2.5 py-1.5 rounded-md border border-white/5 flex gap-2"
                          >
                            <span className="text-rose-400 font-bold">•</span>
                            {rep.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {tab !== "reports" && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-3 mt-2 rounded-xl text-white font-bold transition-colors flex justify-center ${
                tab === "remove"
                  ? "bg-rose-500 hover:bg-rose-600"
                  : tab === "version"
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : tab === "remove" ? (
                "Delete from Database"
              ) : tab === "version" ? (
                "Publish Release"
              ) : (
                "Save to Database"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ChangelogModal = ({ appInfo, onClose }) => (
  <div
    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    onClick={onClose}
  >
    <div
      className="bg-[#121214] border border-white/10 rounded-[24px] shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Changelog & Version
          </h3>
          <p className="text-xs text-indigo-400 font-semibold mt-0.5">
            Current Version: {appInfo.version}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 custom-scrollbar">
        {(appInfo?.changelog || []).map((item, idx) => (
          <div
            key={item.version + idx}
            className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-md">
                {item.version}
              </span>
              <span className="text-xs text-gray-500">{item.date}</span>
            </div>
            <h4 className="text-base font-bold text-white">{item.title}</h4>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 mt-1">
              {item.changes.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminWelcomeOverlay = () => {
  const particles = Array.from({ length: 50 });
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none bg-black/60 backdrop-blur-md animate-in fade-in duration-300 exit:animate-out exit:fade-out exit:duration-500">
      {particles.map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 150 + Math.random() * 400;
        const tx = Math.cos(angle) * velocity + "px";
        const ty = Math.sin(angle) * velocity + "px";
        const rot = Math.random() * 720 + "deg";
        const colors = [
          "#f59e0b",
          "#d946ef",
          "#10b981",
          "#3b82f6",
          "#ef4444",
          "#ffffff",
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <div
            key={i}
            className="particle w-3 h-3 sm:w-4 sm:h-4 rounded-sm absolute shadow-[0_0_10px_currentColor]"
            style={{
              backgroundColor: color,
              color: color,
              "--tx": tx,
              "--ty": ty,
              "--rot": rot,
            }}
          />
        );
      })}
      <div className="animate-in zoom-in slide-in-from-bottom-10 duration-700 ease-out flex flex-col items-center gap-6 mt-[-10vh]">
        <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center border-2 border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.6)]">
          <ShieldAlert className="w-12 h-12 text-amber-400 drop-shadow-lg" />
        </div>
        <h2 className="text-4xl sm:text-6xl font-black text-white text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] tracking-tight">
          Welcome to <span className="text-amber-400">Super Admin</span> Mode!
        </h2>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [communityLoadouts, setCommunityLoadouts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appInfo, setAppInfo] = useState({
    version: APP_VERSION,
    changelog: CHANGELOG_ITEMS,
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [headerClicks, setHeaderClicks] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingLoadout, setEditingLoadout] = useState(null);
  const [reportingLoadout, setReportingLoadout] = useState(null);
  const [customDb, setCustomDb] = useState({ weapons: {}, overrides: {} });
  const [showDbManager, setShowDbManager] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== "undefined" && __initial_auth_token)
          await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);

        const configRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "config",
          "weapon_schema"
        );
        onSnapshot(
          configRef,
          (docSnap) => {
            if (docSnap.exists()) setCustomDb(docSnap.data());
          },
          (err) => console.error("Config error:", err)
        );

        const appInfoRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "config",
          "app_info"
        );
        onSnapshot(
          appInfoRef,
          (docSnap) => {
            if (docSnap.exists()) setAppInfo(docSnap.data());
          },
          (err) => console.error("App info error:", err)
        );
      } catch (err) {
        console.error("Auth Error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadoutsRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "loadouts"
    );
    const unsubLoadouts = onSnapshot(
      loadoutsRef,
      (snapshot) => {
        setCommunityLoadouts(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLoading(false);
      },
      (error) => {
        console.error("Loadouts error:", error);
        setLoading(false);
      }
    );

    const announcementsRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "announcements"
    );
    const q = query(announcementsRef, orderBy("timestamp", "desc"), limit(3));
    const unsubAnnouncements = onSnapshot(q, (snapshot) => {
      setAnnouncements(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => {
      unsubLoadouts();
      unsubAnnouncements();
    };
  }, [user]);

  const handlePostAnnouncement = async (text) => {
    if (!isAdmin) return;
    try {
      const announcementsRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "announcements"
      );
      await addDoc(announcementsRef, { text, timestamp: Date.now() });
      const allQ = query(announcementsRef, orderBy("timestamp", "desc"));
      const allSnap = await getDocs(allQ);
      if (allSnap.docs.length > 3) {
        const toDelete = allSnap.docs.slice(3);
        for (const docSnapshot of toDelete) await deleteDoc(docSnapshot.ref);
      }
    } catch (error) {
      console.error("Error posting announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "announcements", id)
      );
    } catch (error) {}
  };

  const handleToggleReaction = async (loadout, reactionType) => {
    if (!user) return;
    const arrayName =
      reactionType === "like"
        ? "likedBy"
        : reactionType === "dislike"
        ? "dislikedBy"
        : "heartedBy";
    const hasReacted = loadout[arrayName]?.includes(user.uid);
    const newArray = hasReacted
      ? (loadout[arrayName] || []).filter((uid) => uid !== user.uid)
      : [...(loadout[arrayName] || []), user.uid];
    try {
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "loadouts",
        loadout.id
      );
      if (loadout.id.startsWith("sys-") || loadout.id.startsWith("pro-")) {
        const original = SYSTEM_TEMPLATES.find((t) => t.id === loadout.id);
        await setDoc(
          docRef,
          { ...original, ...loadout, [arrayName]: newArray },
          { merge: true }
        );
      } else {
        await updateDoc(docRef, { [arrayName]: newArray });
      }
    } catch (error) {}
  };

  const handleReport = async (loadout, reason) => {
    if (!user) return;
    const hasReported = loadout.reportedBy?.includes(user.uid);
    if (hasReported) return;
    const newReports = [...(loadout.reportedBy || []), user.uid];
    const newReportDetails = [
      ...(loadout.reportDetails || []),
      { uid: user.uid, reason, timestamp: Date.now() },
    ];
    try {
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "loadouts",
        loadout.id
      );
      if (loadout.id.startsWith("sys-") || loadout.id.startsWith("pro-")) {
        const original = SYSTEM_TEMPLATES.find((t) => t.id === loadout.id);
        await setDoc(
          docRef,
          {
            ...original,
            ...loadout,
            reportedBy: newReports,
            reportDetails: newReportDetails,
          },
          { merge: true }
        );
      } else {
        await updateDoc(docRef, {
          reportedBy: newReports,
          reportDetails: newReportDetails,
        });
      }
    } catch (error) {}
    setReportingLoadout(null);
  };

  const handleHeaderClick = () => {
    const now = Date.now();
    const recentClicks = headerClicks.filter((time) => now - time < 3000);
    const newClicks = [...recentClicks, now];
    setHeaderClicks(newClicks);
    if (newClicks.length >= 7 && !isAdmin) {
      setShowAdminModal(true);
      setHeaderClicks([]);
    }
  };

  const handleAdminUnlock = () => {
    if (btoa(adminPasscode.toLowerCase()) === "d29sZmll") {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPasscode("");
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 3500);
    } else {
      setAdminPasscode("");
      setShowAdminModal(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      if (
        deleteConfirmId.startsWith("sys-") ||
        deleteConfirmId.startsWith("pro-")
      ) {
        await setDoc(
          doc(
            db,
            "artifacts",
            appId,
            "public",
            "data",
            "loadouts",
            deleteConfirmId
          ),
          { deleted: true },
          { merge: true }
        );
      } else {
        await deleteDoc(
          doc(
            db,
            "artifacts",
            appId,
            "public",
            "data",
            "loadouts",
            deleteConfirmId
          )
        );
      }
      setDeleteConfirmId(null);
    } catch (error) {}
  };

  const handleSaveEdit = async (id, updatedData) => {
    try {
      if (id.startsWith("sys-") || id.startsWith("pro-")) {
        const original = SYSTEM_TEMPLATES.find((t) => t.id === id);
        await setDoc(
          doc(db, "artifacts", appId, "public", "data", "loadouts", id),
          { ...original, ...updatedData },
          { merge: true }
        );
      } else {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "loadouts", id),
          updatedData
        );
      }
      setEditingLoadout(null);
    } catch (error) {}
  };

  const navItems = [
    { id: "discover", icon: Compass, label: "Discover" },
    { id: "meta", icon: Trophy, label: "Meta Tiers" },
    { id: "submit", icon: Plus, label: "Create" },
  ];

  const communityIdsCurrent = new Set(communityLoadouts.map((l) => l.id));
  const activeSystemTemplatesCurrent = SYSTEM_TEMPLATES.filter(
    (l) => !communityIdsCurrent.has(l.id)
  );
  const activeCommunityLoadouts = communityLoadouts.filter((l) => !l.deleted);
  const displayLoadouts = [
    ...activeSystemTemplatesCurrent,
    ...activeCommunityLoadouts,
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans overflow-x-hidden selection:bg-white/20 relative">
      {isAdmin && (
        <div className="fixed inset-0 pointer-events-none border-[3px] sm:border-[4px] border-amber-500/20 z-[150] shadow-[inset_0_0_40px_rgba(245,158,11,0.15)] transition-all duration-1000 animate-in fade-in"></div>
      )}
      <div
        className={`fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] pointer-events-none mix-blend-screen transition-colors duration-1000 ${
          isAdmin ? "bg-amber-900/20" : "bg-indigo-900/20"
        }`}
      ></div>
      <div
        className={`fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] pointer-events-none mix-blend-screen transition-colors duration-1000 ${
          isAdmin ? "bg-fuchsia-900/30" : "bg-zinc-800/40"
        }`}
      ></div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full pt-safe relative z-10 min-h-screen flex flex-col items-center">
        <header className="flex flex-col items-center justify-center w-full mb-8 relative">
          <div
            onClick={handleHeaderClick}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg cursor-pointer select-none active:scale-95 transition-transform"
          >
            <Crosshair
              className={`w-5 h-5 ${
                isAdmin
                  ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  : "text-indigo-400"
              }`}
            />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Gunsmith<span className="text-gray-400 font-medium">Hub</span>
            </h1>
          </div>
          <p className="text-[13.5px] text-gray-400 font-medium mt-4 text-center max-w-sm px-4">
            Explore, create, and share the ultimate loadouts for Call of Duty:
            Mobile.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest opacity-70">
              By TheWolfOfCodm{" "}
              {isAdmin && (
                <span className="text-amber-400 font-bold ml-1 drop-shadow-md">
                  (Super Admin)
                </span>
              )}
            </p>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDbManager(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-colors"
                >
                  <Database className="w-3 h-3" /> DB Manager
                </button>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-gray-500/20 transition-colors"
                >
                  <Lock className="w-3 h-3" /> Exit Admin
                </button>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center flex-grow">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            {activeTab === "discover" && (
              <FeedView
                loadouts={displayLoadouts}
                title="Discover Loadouts"
                subtitle="Browse meta builds from pro players and the community."
                emptyMessage="No loadouts found for this filter combination."
                currentUser={user}
                onReact={handleToggleReaction}
                isAdmin={isAdmin}
                onDelete={(id) => setDeleteConfirmId(id)}
                onEdit={(loadout) => setEditingLoadout(loadout)}
                customDb={customDb}
                onReport={(loadout) => setReportingLoadout(loadout)}
                announcements={announcements}
                onPostAnnouncement={handlePostAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            )}
            {activeTab === "meta" && (
              <MetaTierView loadouts={displayLoadouts} />
            )}
            {activeTab === "submit" && (
              <SubmitView user={user} isAdmin={isAdmin} customDb={customDb} />
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#121214]/90 backdrop-blur-3xl border border-white/10 p-1.5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-white text-black shadow-md scale-100"
                  : "text-gray-400 hover:text-white hover:bg-white/5 active:scale-95"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className={`${isActive ? "block" : "hidden sm:block"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <footer className="w-full py-6 text-center text-xs text-gray-500 relative z-10 pb-28">
        <span>GunsmithHub</span> <span className="mx-1">•</span>
        <button
          onClick={() => setShowChangelog(true)}
          className="text-indigo-400 hover:underline font-bold"
        >
          {appInfo.version}
        </button>{" "}
        <span className="mx-1">•</span>
        <span>By TheWolfOfCodm</span>
      </footer>

      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-white/10 p-6 rounded-[24px] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-indigo-500/20 rounded-full">
                <Lock className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Admin Access
              </h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Enter the secret passcode to manage community submissions.
            </p>
            <input
              type="password"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              placeholder="Passcode..."
              className="w-full bg-[#151517] text-white rounded-xl px-4 py-3 text-base outline-none border border-white/5 focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all mb-6"
              onKeyDown={(e) => e.key === "Enter" && handleAdminUnlock()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminPasscode("");
                }}
                className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminUnlock}
                className="flex-1 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-white/10 p-6 rounded-[24px] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/20 rounded-full">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Delete Loadout?
              </h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to permanently delete this community
              submission? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-rose-500/20 text-rose-500 font-bold hover:bg-rose-500/30 border border-rose-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {editingLoadout && (
        <EditModal
          loadout={editingLoadout}
          onClose={() => setEditingLoadout(null)}
          onSave={handleSaveEdit}
          customDb={customDb}
          isAdmin={isAdmin}
        />
      )}
      {reportingLoadout && (
        <ReportModal
          loadout={reportingLoadout}
          onClose={() => setReportingLoadout(null)}
          onSubmit={handleReport}
        />
      )}
      {showDbManager && (
        <DbManagerModal
          customDb={customDb}
          appInfo={appInfo}
          loadouts={displayLoadouts}
          onClose={() => setShowDbManager(false)}
        />
      )}
      {showChangelog && (
        <ChangelogModal
          appInfo={appInfo}
          onClose={() => setShowChangelog(false)}
        />
      )}
      {showWelcome && <AdminWelcomeOverlay />}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        .pt-safe { padding-top: max(env(safe-area-inset-top), 1rem); }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background-color: black; }
        @keyframes explosion { 0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(var(--rot)); opacity: 0; } }
        .particle { position: absolute; left: 50%; top: 50%; animation: explosion 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
      `,
        }}
      />
    </div>
  );
}
