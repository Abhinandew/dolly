/**
 * Dolly Appearance and Customization Types
 */

export type OutfitType =
  | 'none'
  | 'hoodie'
  | 'suspenders'
  | 'bowtie'
  | 'athletic'
  | 'cape'
  | 'tracksuit';

export type AccessoryType =
  | 'none'
  | 'headphones'
  | 'cool_shades'
  | 'party_visor'
  | 'top_hat'
  | 'halo'
  | 'crown'
  | 'cat_ears'
  | 'devil_horns'
  | 'flower_crown'
  | 'ninja_band'
  | 'star_glasses';

export interface DollyAppearance {
  bodyColor: string;
  accentColor: string;
  glowColor: string;
  glowIntensity: number;
  outfit: OutfitType;
  accessory: AccessoryType;
  proportions: {
    chubbiness: number;
    heightScale: number;
    headScale: number;
  };
}

export const DEFAULT_APPEARANCE: DollyAppearance = {
  bodyColor: '#FFFFFF',
  accentColor: '#6366F1',
  glowColor: 'rgba(99, 102, 241, 0.3)',
  glowIntensity: 0.5,
  outfit: 'none',
  accessory: 'none',
  proportions: {
    chubbiness: 1.0,
    heightScale: 1.0,
    headScale: 1.0,
  }
};
