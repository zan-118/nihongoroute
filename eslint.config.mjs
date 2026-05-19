import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

export default [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "no-restricted-syntax": [
        "warn",
        {
          "selector": "VariableDeclarator[id.type='ObjectPattern'][init.callee.name=/^(useUserStore|useSRSStore|useUIStore|useAuthStore)$/]",
          "message": "Zustand destructuring is forbidden to prevent infinite re-renders. Use Atomic Selectors instead: `const value = useStore(state => state.value)`. See ARCHITECTURE.md."
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "off"
    },
  },
  {
    ignores: [
      ".next/*",
      "node_modules/*",
      "public/*",
      "dist/*",
      "out/*",
      "build/*",
      "scripts/*",
      "scratch/*",
      "legacy_studio_backup/*"
    ],
  },
];
