/*
 * Plant species — unlocked at level milestones.
 * Each species has 7 growth stages reusing the tree_1..7 images for now;
 * `tint` adds a CSS hue-rotate to give each species a distinct look until
 * dedicated art exists. Replace `images` with species-specific assets later.
 */
export const PLANT_SPECIES = [
  { id: 'sprout',    name: 'Sprout',    emoji: '🌱', unlockLevel: 1,  tint: 0   },
  { id: 'fern',      name: 'Fern',      emoji: '🌿', unlockLevel: 3,  tint: 30  },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', unlockLevel: 5,  tint: 60  },
  { id: 'cactus',    name: 'Cactus',    emoji: '🌵', unlockLevel: 8,  tint: 90  },
  { id: 'bonsai',    name: 'Bonsai',    emoji: '🎋', unlockLevel: 12, tint: 140 },
  { id: 'cherry',    name: 'Cherry',    emoji: '🌸', unlockLevel: 16, tint: 320 },
  { id: 'maple',     name: 'Maple',     emoji: '🍁', unlockLevel: 20, tint: 350 },
]

export function speciesFor(id) {
  return PLANT_SPECIES.find(s => s.id === id) || PLANT_SPECIES[0]
}

export function unlockedSpecies(level) {
  return PLANT_SPECIES.filter(s => level >= s.unlockLevel)
}
