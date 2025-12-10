// PDF Branding Constants for Squad Export

export const PDF_BRANDING = {
  colors: {
    primary: '#5B6FF7',
    secondary: '#8B5CF6',
    accent: '#6FE3D8',
    cyan: '#6FE3D8',
    blue: '#5B6FF7',
    darkBlue: '#4A5AE8',
    white: '#FFFFFF',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  dimensions: {
    a4Width: 1123, // A4 landscape width
    a4Height: 794, // A4 landscape height
  },
  spacing: {
    header: 60,
    footer: 40,
    contentPadding: 40,
  },
};

export const SPANISH_MONTHS = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
];

export function getCurrentSpanishDate(): string {
  const now = new Date();
  const month = SPANISH_MONTHS[now.getMonth()];
  const year = now.getFullYear();
  return `${month} ${year}`;
}
