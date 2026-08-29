import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

/**
 * eslint-config-next 16 ships native flat configs, so there is no FlatCompat
 * bridge here — that combination throws on ESLint 10, which is also why ESLint
 * is pinned to 9.x (eslint-plugin-react is not 10-ready yet).
 */
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "public/**", "out/**", "next-env.d.ts"],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  /* --------------------------------------------------------------------------
     LEGACY DEMOS
     The small builds under /lab and the older playground toys predate this
     rebuild. They work, and they are self-contained throwaway demos, so their
     pre-existing hook-purity and require()-import issues are reported as
     warnings rather than errors — otherwise `npm run check` is all noise and
     no signal for the code that actually matters.

     New work does not get this treatment. If you rewrite one of these, delete
     its path from the list and fix what surfaces.
     ----------------------------------------------------------------------- */
  {
    files: [
      "app/lab/**/*.{ts,tsx}",
      "app/fun/(fun)/chess/**/*.{ts,tsx}",
      "app/fun/(fun)/luckRanked/**/*.{ts,tsx}",
      "app/fun/(fun)/music*/**/*.{ts,tsx}",
      "app/fun/(fun)/reactiveMusic/**/*.{ts,tsx}",
      "components/landingPages/**/*.{ts,tsx}",
      "useful/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "prefer-const": "warn",
      "no-var": "warn",
    },
  },
]

export default eslintConfig
