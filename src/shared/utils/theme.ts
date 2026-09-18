export interface ThemeAccentOption {
  id: string;
  name: string;
  color: string;
}

export const THEME_ACCENT_PRESETS: ThemeAccentOption[] = [
  { id: 'blue', name: 'GitLab Blue', color: '#2563eb' },
  { id: 'violet', name: 'Violet', color: '#7c3aed' },
  { id: 'emerald', name: 'Emerald', color: '#059669' },
  { id: 'rose', name: 'Rose', color: '#e11d48' },
  { id: 'amber', name: 'Amber', color: '#d97706' },
  { id: 'cyan', name: 'Cyan', color: '#0891b2' },
  { id: 'orange', name: 'Orange', color: '#ea580c' },
  { id: 'slate', name: 'Slate', color: '#475569' },
];

export function adjustHexBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;

  const amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00ff) + amt;
  let B = (num & 0x0000ff) + amt;

  R = Math.min(255, Math.max(0, R));
  G = Math.min(255, Math.max(0, G));
  B = Math.min(255, Math.max(0, B));

  return (
    '#' +
    (0x1000000 + R * 0x10000 + G * 0x100 + B)
      .toString(16)
      .slice(1)
  );
}

export function getThemeStyles(accentColor: string = '#2563eb'): React.CSSProperties {
  const hoverColor = adjustHexBrightness(accentColor, -14);
  return {
    '--accent-color': accentColor,
    '--accent-hover': hoverColor,
    '--accent-light': `${accentColor}18`, // ~10%
    '--accent-border': `${accentColor}38`, // ~22%
  } as React.CSSProperties;
}
