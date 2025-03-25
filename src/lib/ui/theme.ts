// src/lib/ui/theme.ts
// Theme configuration for Wizard's Choice

export const theme = {
  colors: {
    // Primary colors
    primary: {
      main: '#6a3de8', // Rich purple (user's preferred color)
      light: '#8c65f7',
      dark: '#4a2ba6',
      contrastText: '#ffffff',
    },
    // Secondary colors
    secondary: {
      main: '#ff9d00', // Magical amber
      light: '#ffb84d',
      dark: '#cc7e00',
      contrastText: '#000000',
    },
    // Element colors for spells
    elements: {
      fire: '#ff5722',
      water: '#2196f3',
      earth: '#8bc34a',
      air: '#b2ebf2',
      arcane: '#9c27b0',
      nature: '#4caf50',
      shadow: '#424242',
      light: '#ffeb3b',
    },
    // UI colors
    ui: {
      background: '#1a1a2e', // Deep space purple
      backgroundLight: '#2d2d42',
      card: '#272640',
      cardBorder: '#4a4a82',
      text: '#ffffff',
      textSecondary: '#b3b3cc',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
    },
    // Status bars
    statusBars: {
      health: {
        background: '#3d0000',
        fill: '#ff3b3b',
      },
      mana: {
        background: '#001a33',
        fill: '#3b7aff',
      },
      experience: {
        background: '#1a3300',
        fill: '#7aff3b',
      },
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: '"Cinzel", serif',
      secondary: '"Raleway", sans-serif',
      monospace: '"Fira Code", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '2.5rem',
      '4xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  
  // Borders
  borders: {
    radius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
    },
    width: {
      thin: '1px',
      normal: '2px',
      thick: '4px',
      extraThick: '8px',
    },
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    xl: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    outline: '0 0 0 3px rgba(106, 61, 232, 0.5)',
    none: 'none',
  },
  
  // Animations
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      verySlow: '1000ms',
    },
    easings: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  
  // Z-index
  zIndex: {
    background: -1,
    default: 1,
    tooltip: 10,
    dropdown: 20,
    modal: 30,
    overlay: 40,
    toast: 50,
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Helper functions for using the theme
export const getElementColor = (element: string): string => {
  return theme.colors.elements[element as keyof typeof theme.colors.elements] || theme.colors.primary.main;
};

export const getStatusBarColors = (type: 'health' | 'mana' | 'experience') => {
  return theme.colors.statusBars[type];
};

export default theme;
