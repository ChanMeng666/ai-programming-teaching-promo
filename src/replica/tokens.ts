// MindMarket tokens, mirrored from the product's src/css/tokens.css. The gate
// asserts every hex here occurs in that file. No shadows, no gradients.

export const C = {
  grass: '#8ed462',
  cream: '#f5f1e4',
  ink: '#2c2e2a',
  white: '#ffffff',
  sand: '#e0dbce',
  stone: '#80827f',
  mist: '#d5d5d4',
  sky: '#2ba0ff',
  coral: '#ff705d',
  sun: '#f5e211',
  muted: '#5d5f5b',
} as const;

export const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, Consolas, monospace";
export const HAIR = `1px solid ${C.mist}`;
