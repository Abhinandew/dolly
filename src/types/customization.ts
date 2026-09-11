/**
 * Dolly Appearance and Customization Types
 */

export type OutfitType = 'none' | 'hoodie' | 'suspenders' | 'bowtie' | 'dj_vest' | 'athletic';
export type AccessoryType = 'none' | 'headphones' | 'cool_shades' | 'party_visor' | 'top_hat' | 'halo' | 'ribbon';

export interface DollyAppearance {
  bodyColor: string;          // Hex color (default: #FFFFFF)
  accentColor: string;        // Hex color (default: #6366F1)
  glowColor: string;          // Glow color around Dolly
  glowIntensity: number;      // 0.0 to 1.0
  outfit: OutfitType;
  accessory: AccessoryType;
  proportions: {
    chubbiness: number;       // 0.8 to 1.3 multiplier
    heightScale: number;      // 0.8 to 1.2
    headScale: number;        // 0.8 to 1.3
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
