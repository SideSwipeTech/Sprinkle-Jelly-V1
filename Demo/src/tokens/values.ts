// GENERATED FILE — DO NOT EDIT BY HAND.
// Source of truth: package/values.json
// Regenerate:      pnpm design:generate      Verify no drift: pnpm design:check

export const VALUES = {
  "version": "0.3.0",
  "identities": [
    {
      "key": "halo",
      "label": "Halo",
      "reading": "Luminous depth, calm, spacious. The identity a nervous learner would choose.",
      "kind": "package",
      "schemes": [
        "light",
        "dark"
      ]
    },
    {
      "key": "voyage",
      "label": "Voyage",
      "reading": "Spatial, cinematic, a place you move through. Built to sell the annual recap.",
      "kind": "package",
      "schemes": [
        "light",
        "dark"
      ]
    },
    {
      "key": "forge",
      "label": "Forge",
      "reading": "Dense, engineered, drafted. Information first, ornament last.",
      "kind": "package",
      "schemes": [
        "light",
        "dark"
      ]
    },
    {
      "key": "meridian",
      "label": "Meridian",
      "reading": "Flat, precise, low-stimulus. Border-only elevation, no glow, no ambient field.",
      "kind": "package",
      "schemes": [
        "light",
        "dark"
      ]
    },
    {
      "key": "atlas",
      "label": "Atlas",
      "reading": "Pixel-faithful previous platform: light = its Day, dark = its Dusk.",
      "kind": "family",
      "schemes": [
        "light",
        "dark"
      ]
    },
    {
      "key": "atelier",
      "label": "Atelier",
      "reading": "The studio: paper in light, graphite in dark.",
      "kind": "family",
      "schemes": [
        "light",
        "dark"
      ]
    }
  ],
  "subthemes": [
    {
      "key": "halo",
      "label": "Halo",
      "reading": "v3-aurora carried forward: luminous depth, calm, spacious. The identity a nervous learner would choose.",
      "register": "spring",
      "construction": "plane",
      "ambient": "aurora-mesh",
      "chargeStops": [
        "0%",
        "68%",
        "100%"
      ]
    },
    {
      "key": "voyage",
      "label": "Voyage",
      "reading": "v5-kinetic carried forward: spatial, cinematic, a place you move through. Built to sell the annual recap.",
      "register": "cinematic",
      "construction": "layered",
      "ambient": "duotone-field",
      "chargeStops": [
        "0%",
        "55%",
        "100%"
      ]
    },
    {
      "key": "forge",
      "label": "Forge",
      "reading": "The previous platform's layout thinking made first-class: dense, engineered, drafted. The charge language at full strength.",
      "register": "mechanical",
      "construction": "chamfered-plate",
      "ambient": "grid-lattice",
      "chargeStops": [
        "0%",
        "72%",
        "100%"
      ]
    },
    {
      "key": "meridian",
      "label": "Meridian",
      "reading": "Flat, precise, low-stimulus. No blur, no glow, no ambient field. The honest home for reduced motion and for a sealed sitting, where ambience is wrong.",
      "register": "functional",
      "construction": "ruled",
      "ambient": "none",
      "chargeStops": [
        "0%",
        "50%",
        "100%"
      ]
    }
  ],
  "themes": [
    "light",
    "dark"
  ],
  "followSystem": "selection-mode",
  "bands": [
    {
      "key": "compact",
      "min": 0,
      "max": 599,
      "shell": "drawer",
      "columns": 1
    },
    {
      "key": "tabletNarrow",
      "min": 600,
      "max": 899,
      "shell": "drawer",
      "columns": 1
    },
    {
      "key": "standard",
      "min": 900,
      "max": 1279,
      "shell": "rail-compact",
      "columns": 2
    },
    {
      "key": "wide",
      "min": 1280,
      "max": null,
      "shell": "rail-expanded",
      "columns": 3
    }
  ],
  "states": [
    {
      "key": "data",
      "tone": "neutral",
      "tell": "none",
      "label": null
    },
    {
      "key": "stale",
      "tone": "warning",
      "tell": "clock",
      "label": "as of"
    },
    {
      "key": "pending",
      "tone": "info",
      "tell": "pulse",
      "label": "working"
    },
    {
      "key": "unavailable",
      "tone": "muted",
      "tell": "hatch",
      "label": "unavailable"
    },
    {
      "key": "empty",
      "tone": "muted",
      "tell": "outline",
      "label": "nothing yet"
    },
    {
      "key": "refused",
      "tone": "error",
      "tell": "barrier",
      "label": "cannot continue"
    },
    {
      "key": "pruned",
      "tone": "muted",
      "tell": "dotted",
      "label": "detail no longer kept"
    }
  ],
  "accents": [
    {
      "key": "ember",
      "label": "Ember"
    },
    {
      "key": "jade",
      "label": "Jade"
    },
    {
      "key": "orchid",
      "label": "Orchid"
    },
    {
      "key": "glacier",
      "label": "Glacier"
    },
    {
      "key": "azure",
      "label": "Azure"
    }
  ],
  "accentDefault": null,
  "accentDefaultLabel": "Theme default",
  "accentValues": {
    "halo": {
      "light": {
        "ember": {
          "accentPrimary": "#714c93",
          "onAccentPrimary": "#ffffff"
        },
        "jade": {
          "accentPrimary": "#405da1",
          "onAccentPrimary": "#ffffff"
        },
        "orchid": {
          "accentPrimary": "#6841c1",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#3e5ab8",
          "onAccentPrimary": "#ffffff"
        },
        "azure": {
          "accentPrimary": "#3a5ace",
          "onAccentPrimary": "#ffffff"
        }
      },
      "dark": {
        "ember": {
          "accentPrimary": "#906bb0",
          "onAccentPrimary": "#000000"
        },
        "jade": {
          "accentPrimary": "#5f7dbe",
          "onAccentPrimary": "#000000"
        },
        "orchid": {
          "accentPrimary": "#8761de",
          "onAccentPrimary": "#000000"
        },
        "glacier": {
          "accentPrimary": "#5d7ad5",
          "onAccentPrimary": "#000000"
        },
        "azure": {
          "accentPrimary": "#597aeb",
          "onAccentPrimary": "#000000"
        }
      }
    },
    "voyage": {
      "light": {
        "ember": {
          "accentPrimary": "#852fa0",
          "onAccentPrimary": "#ffffff"
        },
        "jade": {
          "accentPrimary": "#5441ad",
          "onAccentPrimary": "#ffffff"
        },
        "orchid": {
          "accentPrimary": "#7c25cd",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#523dc5",
          "onAccentPrimary": "#ffffff"
        },
        "azure": {
          "accentPrimary": "#4e3dda",
          "onAccentPrimary": "#ffffff"
        }
      },
      "dark": {
        "ember": {
          "accentPrimary": "#9a54b4",
          "onAccentPrimary": "#ffffff"
        },
        "jade": {
          "accentPrimary": "#6a66c2",
          "onAccentPrimary": "#ffffff"
        },
        "orchid": {
          "accentPrimary": "#914ae2",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#6863d9",
          "onAccentPrimary": "#ffffff"
        },
        "azure": {
          "accentPrimary": "#6463ef",
          "onAccentPrimary": "#ffffff"
        }
      }
    },
    "forge": {
      "light": {
        "ember": {
          "accentPrimary": "#415988",
          "onAccentPrimary": "#ffffff"
        },
        "jade": {
          "accentPrimary": "#116a96",
          "onAccentPrimary": "#ffffff"
        },
        "orchid": {
          "accentPrimary": "#384eb5",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#0f67ad",
          "onAccentPrimary": "#ffffff"
        },
        "azure": {
          "accentPrimary": "#0b67c2",
          "onAccentPrimary": "#ffffff"
        }
      },
      "dark": {
        "ember": {
          "accentPrimary": "#5579aa",
          "onAccentPrimary": "#000000"
        },
        "jade": {
          "accentPrimary": "#258bb8",
          "onAccentPrimary": "#000000"
        },
        "orchid": {
          "accentPrimary": "#4c6fd8",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#2387cf",
          "onAccentPrimary": "#000000"
        },
        "azure": {
          "accentPrimary": "#1f87e5",
          "onAccentPrimary": "#000000"
        }
      }
    },
    "meridian": {
      "light": {
        "ember": {
          "accentPrimary": "#45516a",
          "onAccentPrimary": "#ffffff"
        },
        "jade": {
          "accentPrimary": "#156278",
          "onAccentPrimary": "#ffffff"
        },
        "orchid": {
          "accentPrimary": "#3c4698",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#135f8f",
          "onAccentPrimary": "#ffffff"
        },
        "azure": {
          "accentPrimary": "#0f5fa5",
          "onAccentPrimary": "#ffffff"
        }
      },
      "dark": {
        "ember": {
          "accentPrimary": "#62769c",
          "onAccentPrimary": "#000000"
        },
        "jade": {
          "accentPrimary": "#3288aa",
          "onAccentPrimary": "#000000"
        },
        "orchid": {
          "accentPrimary": "#596cca",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#3085c1",
          "onAccentPrimary": "#000000"
        },
        "azure": {
          "accentPrimary": "#2c85d7",
          "onAccentPrimary": "#000000"
        }
      }
    },
    "atlas": {
      "light": {
        "ember": {
          "accentPrimary": "#c2410c",
          "onAccentPrimary": "#ffffff"
        },
        "jade": {
          "accentPrimary": "#15803d",
          "onAccentPrimary": "#ffffff"
        },
        "orchid": {
          "accentPrimary": "#a21caf",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#0e7490",
          "onAccentPrimary": "#ffffff"
        },
        "azure": {
          "accentPrimary": "#0074dd",
          "onAccentPrimary": "#ffffff"
        }
      },
      "dark": {
        "ember": {
          "accentPrimary": "#c2410c",
          "onAccentPrimary": "#ffffff"
        },
        "jade": {
          "accentPrimary": "#15803d",
          "onAccentPrimary": "#ffffff"
        },
        "orchid": {
          "accentPrimary": "#a824b5",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#0e7490",
          "onAccentPrimary": "#ffffff"
        },
        "azure": {
          "accentPrimary": "#0074dd",
          "onAccentPrimary": "#ffffff"
        }
      }
    },
    "atelier": {
      "light": {
        "ember": {
          "accentPrimary": "#b42318",
          "onAccentPrimary": "#ffffff"
        },
        "jade": {
          "accentPrimary": "#15803d",
          "onAccentPrimary": "#ffffff"
        },
        "orchid": {
          "accentPrimary": "#9333ea",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#0f766e",
          "onAccentPrimary": "#ffffff"
        },
        "azure": {
          "accentPrimary": "#1d4ed8",
          "onAccentPrimary": "#ffffff"
        }
      },
      "dark": {
        "ember": {
          "accentPrimary": "#bd2e21",
          "onAccentPrimary": "#ffffff"
        },
        "jade": {
          "accentPrimary": "#15803d",
          "onAccentPrimary": "#ffffff"
        },
        "orchid": {
          "accentPrimary": "#9333ea",
          "onAccentPrimary": "#ffffff"
        },
        "glacier": {
          "accentPrimary": "#0f766e",
          "onAccentPrimary": "#ffffff"
        },
        "azure": {
          "accentPrimary": "#2558e2",
          "onAccentPrimary": "#ffffff"
        }
      }
    }
  },
  "identityAccents": {
    "halo": {
      "light": {
        "accentPrimary": "#4F46E5",
        "accentSecondary": "#9333EA"
      },
      "dark": {
        "accentPrimary": "#6366F1",
        "accentSecondary": "#A855F7"
      }
    },
    "voyage": {
      "light": {
        "accentPrimary": "#6D28D9",
        "accentSecondary": "#B21E7B"
      },
      "dark": {
        "accentPrimary": "#8B5CF6",
        "accentSecondary": "#E0399E"
      }
    },
    "forge": {
      "light": {
        "accentPrimary": "#0F62B8",
        "accentSecondary": "#4B4DD0"
      },
      "dark": {
        "accentPrimary": "#2B8FE8",
        "accentSecondary": "#7B7DF5"
      }
    },
    "meridian": {
      "light": {
        "accentPrimary": "#15578F",
        "accentSecondary": "#3A6480"
      },
      "dark": {
        "accentPrimary": "#3D8BD4",
        "accentSecondary": "#5E8AA8"
      }
    },
    "atlas": {
      "light": {
        "accentPrimary": "#c2410c",
        "accentSecondary": "#e11d48"
      },
      "dark": {
        "accentPrimary": "#c2410c",
        "accentSecondary": "#e11d48"
      }
    },
    "atelier": {
      "light": {
        "accentPrimary": "#c2410c",
        "accentSecondary": "#e11d48"
      },
      "dark": {
        "accentPrimary": "#c2410c",
        "accentSecondary": "#e11d48"
      }
    }
  },
  "typefaces": [
    {
      "key": "identity",
      "label": "Theme default",
      "display": null,
      "sans": null,
      "emits": false
    },
    {
      "key": "bricolage",
      "label": "Bricolage / Inter",
      "display": "\"Bricolage Grotesque Variable\", \"Segoe UI Variable Display\", system-ui, sans-serif",
      "sans": "\"Inter Variable\", Inter, system-ui, sans-serif",
      "emits": true
    },
    {
      "key": "sora",
      "label": "Sora / Inter",
      "display": "\"Sora Variable\", Sora, Inter, system-ui, sans-serif",
      "sans": "\"Inter Variable\", Inter, system-ui, sans-serif",
      "emits": true
    },
    {
      "key": "archivo",
      "label": "Archivo / Inter",
      "display": "\"Archivo Variable\", Archivo, Inter, system-ui, sans-serif",
      "sans": "\"Inter Variable\", Inter, system-ui, sans-serif",
      "emits": true
    },
    {
      "key": "inter",
      "label": "Inter / Inter",
      "display": "\"Inter Variable\", Inter, system-ui, sans-serif",
      "sans": "\"Inter Variable\", Inter, system-ui, sans-serif",
      "emits": true
    }
  ],
  "typefaceDefault": "identity",
  "navModels": [
    {
      "key": "rail",
      "label": "Rail",
      "note": "Grouped column, always visible.",
      "wide": "rail-expanded",
      "standard": "rail-compact",
      "belowStandard": "drawer"
    },
    {
      "key": "spine",
      "label": "Spine",
      "note": "Icon spine with a flyout.",
      "wide": "icon-spine-flyout",
      "standard": "icon-spine-flyout",
      "belowStandard": "drawer"
    },
    {
      "key": "command",
      "label": "Command",
      "note": "No rail. Search is the map.",
      "wide": "command-strip",
      "standard": "command-strip",
      "belowStandard": "drawer"
    },
    {
      "key": "dock",
      "label": "Dock",
      "note": "Floating pill at the foot.",
      "wide": "floating-dock",
      "standard": "floating-dock",
      "belowStandard": "drawer"
    },
    {
      "key": "dual",
      "label": "Dual",
      "note": "Thin spine plus a section rail.",
      "wide": "dual-rail",
      "standard": "dual-rail",
      "belowStandard": "drawer"
    }
  ],
  "navDefault": "rail",
  "navBelowStandard": "drawer"
} as const;

export type IdentityKey = (typeof VALUES.identities)[number]["key"];
export type SubthemeKey = (typeof VALUES.subthemes)[number]["key"];
export type ThemeKey = (typeof VALUES.themes)[number];
export type BandKey = (typeof VALUES.bands)[number]["key"];
export type StateKey = (typeof VALUES.states)[number]["key"];

/** The accent axis: five named tints (O-A; pack O). `null` is "theme default". */
export type AccentKey = (typeof VALUES.accents)[number]["key"];
/** The typeface axis: five pairings; `identity` emits nothing. */
export type TypefaceKey = (typeof VALUES.typefaces)[number]["key"];
/** The navigation-model axis: five models; `rail` is the default. */
export type NavModelKey = (typeof VALUES.navModels)[number]["key"];

/** The name lists a Settings panel renders. One source — do not restate these. */
export const ACCENTS = VALUES.accents;
export const ACCENT_VALUES = VALUES.accentValues;
/**
 * The identity's OWN accent pair, per scheme — what "Theme default" (no tint) paints.
 * Settings › Appearance draws its identity preview from these two stops, so no
 * stylesheet has to repeat a colour to show what an identity looks like.
 */
export const IDENTITY_ACCENTS = VALUES.identityAccents;
export const TYPEFACES = VALUES.typefaces;
export const NAV_MODELS = VALUES.navModels;

/**
 * The twelve combinations SCOPE.md F7 makes launch-critical: six identities by the
 * two schemes. `follow-system` is not a thirteenth — it is how a scheme is chosen,
 * not a scheme (PRF-R6).
 *
 * The accent, typeface and navigation axes are NOT multiplied in: they are learner
 * preferences layered on a pair, each gated on its own (OR-O1; pack O).
 */
export const COMBINATION_COUNT = VALUES.identities.length * VALUES.themes.length;

/** 6 identities x 2 schemes x 5 tints. Every one gated at generate time. */
export const ACCENT_VALUE_COUNT =
  VALUES.identities.length * VALUES.themes.length * VALUES.accents.length;
