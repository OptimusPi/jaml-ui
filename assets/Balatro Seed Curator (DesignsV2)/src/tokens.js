// Balatro design tokens — from jaml-ui/src/ui/tokens.ts
// DO NOT substitute with Lua HEX values; these are shader-output eyedropped.

window.JimboColor = {
  RED: '#ff4c40',
  BLUE: '#0093ff',
  GREEN: '#429f79',
  ORANGE: '#ff9800',
  GOLD: '#e4b643',
  PURPLE: '#9e74ce',

  DARK_RED: '#a02721',
  DARK_BLUE: '#0057a1',
  DARK_ORANGE: '#a05b00',
  DARK_GREEN: '#215f46',
  DARK_PURPLE: '#5e437e',

  DARK_GREY: '#3a5055',
  DARKEST: '#1e2b2d',
  GREY: '#708386',
  TEAL_GREY: '#404c4e',

  PANEL_EDGE: '#1e2e32',
  INNER_BORDER: '#334461',

  BORDER_SILVER: '#b9c2d2',
  BORDER_SOUTH: '#777e89',

  GOLD_TEXT: '#e4b643',
  GREEN_TEXT: '#35bd86',
  ORANGE_TEXT: '#ff8f00',
  WHITE: '#ffffff',
  BLACK: '#000000',
};

// Sprite sheet grid dimensions (from jaml-ui/src/sprites/spriteData.ts)
window.SHEETS = {
  jokers:    { src: 'assets/Jokers.png',    cols: 10, rows: 16 },
  tarots:    { src: 'assets/Tarots.png',    cols: 10, rows: 6  },
  vouchers:  { src: 'assets/Vouchers.png',  cols: 9,  rows: 4  },
  tags:      { src: 'assets/tags.png',      cols: 6,  rows: 5  },
  boosters:  { src: 'assets/Boosters.png',  cols: 4,  rows: 9  },
  blinds:    { src: 'assets/BlindChips.png',cols: 21, rows: 31 },
  editions:  { src: 'assets/Editions.png',  cols: 5,  rows: 1  },
  enhancers: { src: 'assets/Enhancers.png', cols: 7,  rows: 5  },
  stickers:  { src: 'assets/stickers.png',  cols: 5,  rows: 3  },
  deck:      { src: 'assets/8BitDeck.png',  cols: 13, rows: 4  },
  stakes:    { src: 'assets/stakes.png',    cols: 4,  rows: 2  },
};
