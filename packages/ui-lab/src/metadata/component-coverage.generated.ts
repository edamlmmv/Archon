export interface ComponentCoverageEntry {
  id: string;
  officialName: string;
  category: string;
  source: string;
  targetFile: string;
  storybookStoryId: string;
  playwrightTestId: string;
  registryItemPath: string;
  registryDependencies: string[];
  variants: {
    density: string[];
    surface: string[];
    state: string[];
    mode: string[];
  };
  practiceProfilePath: string;
  practiceEvidencePath: string;
  uiUxPractices: string[];
}

export const componentCoverageEntries = [
  {
    "id": "accordion",
    "officialName": "Accordion",
    "category": "disclosure",
    "source": "https://ui.shadcn.com/docs/components#accordion",
    "targetFile": "packages/ui-lab/src/components/ui/accordion.tsx",
    "storybookStoryId": "ui-lab-full-coverage--accordion",
    "playwrightTestId": "ui-lab:accordion",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "alert",
    "officialName": "Alert",
    "category": "feedback",
    "source": "https://ui.shadcn.com/docs/components#alert",
    "targetFile": "packages/ui-lab/src/components/ui/alert.tsx",
    "storybookStoryId": "ui-lab-full-coverage--alert",
    "playwrightTestId": "ui-lab:alert",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "alert-dialog",
    "officialName": "Alert Dialog",
    "category": "overlay",
    "source": "https://ui.shadcn.com/docs/components#alert-dialog",
    "targetFile": "packages/ui-lab/src/components/ui/alert-dialog.tsx",
    "storybookStoryId": "ui-lab-full-coverage--alert-dialog",
    "playwrightTestId": "ui-lab:alert-dialog",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "button"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "aspect-ratio",
    "officialName": "Aspect Ratio",
    "category": "layout",
    "source": "https://ui.shadcn.com/docs/components#aspect-ratio",
    "targetFile": "packages/ui-lab/src/components/ui/aspect-ratio.tsx",
    "storybookStoryId": "ui-lab-full-coverage--aspect-ratio",
    "playwrightTestId": "ui-lab:aspect-ratio",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "avatar",
    "officialName": "Avatar",
    "category": "display",
    "source": "https://ui.shadcn.com/docs/components#avatar",
    "targetFile": "packages/ui-lab/src/components/ui/avatar.tsx",
    "storybookStoryId": "ui-lab-full-coverage--avatar",
    "playwrightTestId": "ui-lab:avatar",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "badge",
    "officialName": "Badge",
    "category": "display",
    "source": "https://ui.shadcn.com/docs/components#badge",
    "targetFile": "packages/ui-lab/src/components/ui/badge.tsx",
    "storybookStoryId": "ui-lab-full-coverage--badge",
    "playwrightTestId": "ui-lab:badge",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "breadcrumb",
    "officialName": "Breadcrumb",
    "category": "navigation",
    "source": "https://ui.shadcn.com/docs/components#breadcrumb",
    "targetFile": "packages/ui-lab/src/components/ui/breadcrumb.tsx",
    "storybookStoryId": "ui-lab-full-coverage--breadcrumb",
    "playwrightTestId": "ui-lab:breadcrumb",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "button",
    "officialName": "Button",
    "category": "action",
    "source": "https://ui.shadcn.com/docs/components#button",
    "targetFile": "packages/ui-lab/src/components/ui/button.tsx",
    "storybookStoryId": "ui-lab-full-coverage--button",
    "playwrightTestId": "ui-lab:button",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "button-group",
    "officialName": "Button Group",
    "category": "action",
    "source": "https://ui.shadcn.com/docs/components#button-group",
    "targetFile": "packages/ui-lab/src/components/ui/button-group.tsx",
    "storybookStoryId": "ui-lab-full-coverage--button-group",
    "playwrightTestId": "ui-lab:button-group",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "button"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "calendar",
    "officialName": "Calendar",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#calendar",
    "targetFile": "packages/ui-lab/src/components/ui/calendar.tsx",
    "storybookStoryId": "ui-lab-full-coverage--calendar",
    "playwrightTestId": "ui-lab:calendar",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "button"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "card",
    "officialName": "Card",
    "category": "layout",
    "source": "https://ui.shadcn.com/docs/components#card",
    "targetFile": "packages/ui-lab/src/components/ui/card.tsx",
    "storybookStoryId": "ui-lab-full-coverage--card",
    "playwrightTestId": "ui-lab:card",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "carousel",
    "officialName": "Carousel",
    "category": "display",
    "source": "https://ui.shadcn.com/docs/components#carousel",
    "targetFile": "packages/ui-lab/src/components/ui/carousel.tsx",
    "storybookStoryId": "ui-lab-full-coverage--carousel",
    "playwrightTestId": "ui-lab:carousel",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "button"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "chart",
    "officialName": "Chart",
    "category": "data",
    "source": "https://ui.shadcn.com/docs/components#chart",
    "targetFile": "packages/ui-lab/src/components/ui/chart.tsx",
    "storybookStoryId": "ui-lab-full-coverage--chart",
    "playwrightTestId": "ui-lab:chart",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "checkbox",
    "officialName": "Checkbox",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#checkbox",
    "targetFile": "packages/ui-lab/src/components/ui/checkbox.tsx",
    "storybookStoryId": "ui-lab-full-coverage--checkbox",
    "playwrightTestId": "ui-lab:checkbox",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "collapsible",
    "officialName": "Collapsible",
    "category": "disclosure",
    "source": "https://ui.shadcn.com/docs/components#collapsible",
    "targetFile": "packages/ui-lab/src/components/ui/collapsible.tsx",
    "storybookStoryId": "ui-lab-full-coverage--collapsible",
    "playwrightTestId": "ui-lab:collapsible",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "combobox",
    "officialName": "Combobox",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#combobox",
    "targetFile": "packages/ui-lab/src/components/ui/combobox.tsx",
    "storybookStoryId": "ui-lab-full-coverage--combobox",
    "playwrightTestId": "ui-lab:combobox",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "button",
      "command",
      "popover"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "command",
    "officialName": "Command",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#command",
    "targetFile": "packages/ui-lab/src/components/ui/command.tsx",
    "storybookStoryId": "ui-lab-full-coverage--command",
    "playwrightTestId": "ui-lab:command",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "dialog"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "context-menu",
    "officialName": "Context Menu",
    "category": "menu",
    "source": "https://ui.shadcn.com/docs/components#context-menu",
    "targetFile": "packages/ui-lab/src/components/ui/context-menu.tsx",
    "storybookStoryId": "ui-lab-full-coverage--context-menu",
    "playwrightTestId": "ui-lab:context-menu",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "data-table",
    "officialName": "Data Table",
    "category": "data",
    "source": "https://ui.shadcn.com/docs/components#data-table",
    "targetFile": "packages/ui-lab/src/components/ui/data-table.tsx",
    "storybookStoryId": "ui-lab-full-coverage--data-table",
    "playwrightTestId": "ui-lab:data-table",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "badge",
      "table"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "date-picker",
    "officialName": "Date Picker",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#date-picker",
    "targetFile": "packages/ui-lab/src/components/ui/date-picker.tsx",
    "storybookStoryId": "ui-lab-full-coverage--date-picker",
    "playwrightTestId": "ui-lab:date-picker",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "button",
      "calendar",
      "popover"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "dialog",
    "officialName": "Dialog",
    "category": "overlay",
    "source": "https://ui.shadcn.com/docs/components#dialog",
    "targetFile": "packages/ui-lab/src/components/ui/dialog.tsx",
    "storybookStoryId": "ui-lab-full-coverage--dialog",
    "playwrightTestId": "ui-lab:dialog",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "direction",
    "officialName": "Direction",
    "category": "layout",
    "source": "https://ui.shadcn.com/docs/components#direction",
    "targetFile": "packages/ui-lab/src/components/ui/direction.tsx",
    "storybookStoryId": "ui-lab-full-coverage--direction",
    "playwrightTestId": "ui-lab:direction",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "drawer",
    "officialName": "Drawer",
    "category": "overlay",
    "source": "https://ui.shadcn.com/docs/components#drawer",
    "targetFile": "packages/ui-lab/src/components/ui/drawer.tsx",
    "storybookStoryId": "ui-lab-full-coverage--drawer",
    "playwrightTestId": "ui-lab:drawer",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "button"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "dropdown-menu",
    "officialName": "Dropdown Menu",
    "category": "menu",
    "source": "https://ui.shadcn.com/docs/components#dropdown-menu",
    "targetFile": "packages/ui-lab/src/components/ui/dropdown-menu.tsx",
    "storybookStoryId": "ui-lab-full-coverage--dropdown-menu",
    "playwrightTestId": "ui-lab:dropdown-menu",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "empty",
    "officialName": "Empty",
    "category": "feedback",
    "source": "https://ui.shadcn.com/docs/components#empty",
    "targetFile": "packages/ui-lab/src/components/ui/empty.tsx",
    "storybookStoryId": "ui-lab-full-coverage--empty",
    "playwrightTestId": "ui-lab:empty",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "field",
    "officialName": "Field",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#field",
    "targetFile": "packages/ui-lab/src/components/ui/field.tsx",
    "storybookStoryId": "ui-lab-full-coverage--field",
    "playwrightTestId": "ui-lab:field",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "label"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "hover-card",
    "officialName": "Hover Card",
    "category": "overlay",
    "source": "https://ui.shadcn.com/docs/components#hover-card",
    "targetFile": "packages/ui-lab/src/components/ui/hover-card.tsx",
    "storybookStoryId": "ui-lab-full-coverage--hover-card",
    "playwrightTestId": "ui-lab:hover-card",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "input",
    "officialName": "Input",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#input",
    "targetFile": "packages/ui-lab/src/components/ui/input.tsx",
    "storybookStoryId": "ui-lab-full-coverage--input",
    "playwrightTestId": "ui-lab:input",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "input-group",
    "officialName": "Input Group",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#input-group",
    "targetFile": "packages/ui-lab/src/components/ui/input-group.tsx",
    "storybookStoryId": "ui-lab-full-coverage--input-group",
    "playwrightTestId": "ui-lab:input-group",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "input"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "input-otp",
    "officialName": "Input OTP",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#input-otp",
    "targetFile": "packages/ui-lab/src/components/ui/input-otp.tsx",
    "storybookStoryId": "ui-lab-full-coverage--input-otp",
    "playwrightTestId": "ui-lab:input-otp",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "item",
    "officialName": "Item",
    "category": "display",
    "source": "https://ui.shadcn.com/docs/components#item",
    "targetFile": "packages/ui-lab/src/components/ui/item.tsx",
    "storybookStoryId": "ui-lab-full-coverage--item",
    "playwrightTestId": "ui-lab:item",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "kbd",
    "officialName": "Kbd",
    "category": "typography",
    "source": "https://ui.shadcn.com/docs/components#kbd",
    "targetFile": "packages/ui-lab/src/components/ui/kbd.tsx",
    "storybookStoryId": "ui-lab-full-coverage--kbd",
    "playwrightTestId": "ui-lab:kbd",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "label",
    "officialName": "Label",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#label",
    "targetFile": "packages/ui-lab/src/components/ui/label.tsx",
    "storybookStoryId": "ui-lab-full-coverage--label",
    "playwrightTestId": "ui-lab:label",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "menubar",
    "officialName": "Menubar",
    "category": "menu",
    "source": "https://ui.shadcn.com/docs/components#menubar",
    "targetFile": "packages/ui-lab/src/components/ui/menubar.tsx",
    "storybookStoryId": "ui-lab-full-coverage--menubar",
    "playwrightTestId": "ui-lab:menubar",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "native-select",
    "officialName": "Native Select",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#native-select",
    "targetFile": "packages/ui-lab/src/components/ui/native-select.tsx",
    "storybookStoryId": "ui-lab-full-coverage--native-select",
    "playwrightTestId": "ui-lab:native-select",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "navigation-menu",
    "officialName": "Navigation Menu",
    "category": "navigation",
    "source": "https://ui.shadcn.com/docs/components#navigation-menu",
    "targetFile": "packages/ui-lab/src/components/ui/navigation-menu.tsx",
    "storybookStoryId": "ui-lab-full-coverage--navigation-menu",
    "playwrightTestId": "ui-lab:navigation-menu",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "pagination",
    "officialName": "Pagination",
    "category": "navigation",
    "source": "https://ui.shadcn.com/docs/components#pagination",
    "targetFile": "packages/ui-lab/src/components/ui/pagination.tsx",
    "storybookStoryId": "ui-lab-full-coverage--pagination",
    "playwrightTestId": "ui-lab:pagination",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "button"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "popover",
    "officialName": "Popover",
    "category": "overlay",
    "source": "https://ui.shadcn.com/docs/components#popover",
    "targetFile": "packages/ui-lab/src/components/ui/popover.tsx",
    "storybookStoryId": "ui-lab-full-coverage--popover",
    "playwrightTestId": "ui-lab:popover",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "progress",
    "officialName": "Progress",
    "category": "feedback",
    "source": "https://ui.shadcn.com/docs/components#progress",
    "targetFile": "packages/ui-lab/src/components/ui/progress.tsx",
    "storybookStoryId": "ui-lab-full-coverage--progress",
    "playwrightTestId": "ui-lab:progress",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "radio-group",
    "officialName": "Radio Group",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#radio-group",
    "targetFile": "packages/ui-lab/src/components/ui/radio-group.tsx",
    "storybookStoryId": "ui-lab-full-coverage--radio-group",
    "playwrightTestId": "ui-lab:radio-group",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "resizable",
    "officialName": "Resizable",
    "category": "layout",
    "source": "https://ui.shadcn.com/docs/components#resizable",
    "targetFile": "packages/ui-lab/src/components/ui/resizable.tsx",
    "storybookStoryId": "ui-lab-full-coverage--resizable",
    "playwrightTestId": "ui-lab:resizable",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "scroll-area",
    "officialName": "Scroll Area",
    "category": "layout",
    "source": "https://ui.shadcn.com/docs/components#scroll-area",
    "targetFile": "packages/ui-lab/src/components/ui/scroll-area.tsx",
    "storybookStoryId": "ui-lab-full-coverage--scroll-area",
    "playwrightTestId": "ui-lab:scroll-area",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "select",
    "officialName": "Select",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#select",
    "targetFile": "packages/ui-lab/src/components/ui/select.tsx",
    "storybookStoryId": "ui-lab-full-coverage--select",
    "playwrightTestId": "ui-lab:select",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "separator",
    "officialName": "Separator",
    "category": "layout",
    "source": "https://ui.shadcn.com/docs/components#separator",
    "targetFile": "packages/ui-lab/src/components/ui/separator.tsx",
    "storybookStoryId": "ui-lab-full-coverage--separator",
    "playwrightTestId": "ui-lab:separator",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "sheet",
    "officialName": "Sheet",
    "category": "overlay",
    "source": "https://ui.shadcn.com/docs/components#sheet",
    "targetFile": "packages/ui-lab/src/components/ui/sheet.tsx",
    "storybookStoryId": "ui-lab-full-coverage--sheet",
    "playwrightTestId": "ui-lab:sheet",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "sidebar",
    "officialName": "Sidebar",
    "category": "layout",
    "source": "https://ui.shadcn.com/docs/components#sidebar",
    "targetFile": "packages/ui-lab/src/components/ui/sidebar.tsx",
    "storybookStoryId": "ui-lab-full-coverage--sidebar",
    "playwrightTestId": "ui-lab:sidebar",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "button",
      "separator",
      "sheet",
      "skeleton",
      "tooltip"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "skeleton",
    "officialName": "Skeleton",
    "category": "feedback",
    "source": "https://ui.shadcn.com/docs/components#skeleton",
    "targetFile": "packages/ui-lab/src/components/ui/skeleton.tsx",
    "storybookStoryId": "ui-lab-full-coverage--skeleton",
    "playwrightTestId": "ui-lab:skeleton",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "slider",
    "officialName": "Slider",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#slider",
    "targetFile": "packages/ui-lab/src/components/ui/slider.tsx",
    "storybookStoryId": "ui-lab-full-coverage--slider",
    "playwrightTestId": "ui-lab:slider",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "sonner",
    "officialName": "Sonner",
    "category": "feedback",
    "source": "https://ui.shadcn.com/docs/components#sonner",
    "targetFile": "packages/ui-lab/src/components/ui/sonner.tsx",
    "storybookStoryId": "ui-lab-full-coverage--sonner",
    "playwrightTestId": "ui-lab:sonner",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "spinner",
    "officialName": "Spinner",
    "category": "feedback",
    "source": "https://ui.shadcn.com/docs/components#spinner",
    "targetFile": "packages/ui-lab/src/components/ui/spinner.tsx",
    "storybookStoryId": "ui-lab-full-coverage--spinner",
    "playwrightTestId": "ui-lab:spinner",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "switch",
    "officialName": "Switch",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#switch",
    "targetFile": "packages/ui-lab/src/components/ui/switch.tsx",
    "storybookStoryId": "ui-lab-full-coverage--switch",
    "playwrightTestId": "ui-lab:switch",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "table",
    "officialName": "Table",
    "category": "data",
    "source": "https://ui.shadcn.com/docs/components#table",
    "targetFile": "packages/ui-lab/src/components/ui/table.tsx",
    "storybookStoryId": "ui-lab-full-coverage--table",
    "playwrightTestId": "ui-lab:table",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "tabs",
    "officialName": "Tabs",
    "category": "navigation",
    "source": "https://ui.shadcn.com/docs/components#tabs",
    "targetFile": "packages/ui-lab/src/components/ui/tabs.tsx",
    "storybookStoryId": "ui-lab-full-coverage--tabs",
    "playwrightTestId": "ui-lab:tabs",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "textarea",
    "officialName": "Textarea",
    "category": "input",
    "source": "https://ui.shadcn.com/docs/components#textarea",
    "targetFile": "packages/ui-lab/src/components/ui/textarea.tsx",
    "storybookStoryId": "ui-lab-full-coverage--textarea",
    "playwrightTestId": "ui-lab:textarea",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "toast",
    "officialName": "Toast",
    "category": "feedback",
    "source": "https://ui.shadcn.com/docs/components#toast",
    "targetFile": "packages/ui-lab/src/components/ui/toast.tsx",
    "storybookStoryId": "ui-lab-full-coverage--toast",
    "playwrightTestId": "ui-lab:toast",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "sonner"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "toggle",
    "officialName": "Toggle",
    "category": "action",
    "source": "https://ui.shadcn.com/docs/components#toggle",
    "targetFile": "packages/ui-lab/src/components/ui/toggle.tsx",
    "storybookStoryId": "ui-lab-full-coverage--toggle",
    "playwrightTestId": "ui-lab:toggle",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "toggle-group",
    "officialName": "Toggle Group",
    "category": "action",
    "source": "https://ui.shadcn.com/docs/components#toggle-group",
    "targetFile": "packages/ui-lab/src/components/ui/toggle-group.tsx",
    "storybookStoryId": "ui-lab-full-coverage--toggle-group",
    "playwrightTestId": "ui-lab:toggle-group",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [
      "toggle"
    ],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "tooltip",
    "officialName": "Tooltip",
    "category": "overlay",
    "source": "https://ui.shadcn.com/docs/components#tooltip",
    "targetFile": "packages/ui-lab/src/components/ui/tooltip.tsx",
    "storybookStoryId": "ui-lab-full-coverage--tooltip",
    "playwrightTestId": "ui-lab:tooltip",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  },
  {
    "id": "typography",
    "officialName": "Typography",
    "category": "typography",
    "source": "https://ui.shadcn.com/docs/components#typography",
    "targetFile": "packages/ui-lab/src/components/ui/typography.tsx",
    "storybookStoryId": "ui-lab-full-coverage--typography",
    "playwrightTestId": "ui-lab:typography",
    "registryItemPath": "packages/ui-lab/registry/new-york/archon-ui-core/registry-item.json",
    "registryDependencies": [],
    "variants": {
      "density": [
        "compact",
        "default",
        "comfortable"
      ],
      "surface": [
        "flat",
        "outline",
        "elevated",
        "ghost"
      ],
      "state": [
        "default",
        "focus",
        "disabled",
        "invalid",
        "loading",
        "empty"
      ],
      "mode": [
        "dark",
        "high-contrast",
        "reduced-motion",
        "responsive"
      ]
    },
    "practiceProfilePath": ".archon/bmad/ui-lab-ui-ux-practices.json",
    "practiceEvidencePath": ".archon/bmad/evidence/ui-lab-ui-ux-practices.md",
    "uiUxPractices": [
      "accessibility-first-interactions",
      "bounded-variant-matrix",
      "semantic-theme-tokens",
      "responsive-layout-integrity",
      "clear-information-hierarchy",
      "storybook-variant-evidence",
      "browser-and-a11y-proof",
      "state-complete-surfaces",
      "motion-with-restraint",
      "composition-ready-slots"
    ]
  }
] as const satisfies readonly ComponentCoverageEntry[];

export type ComponentCoverageId = (typeof componentCoverageEntries)[number]['id'];

export function getComponentCoverageEntry(componentId: ComponentCoverageId): ComponentCoverageEntry {
  const entry = componentCoverageEntries.find(candidate => candidate.id === componentId);
  if (!entry) throw new Error(`Unknown component coverage id: ${componentId}`);
  return entry;
}
