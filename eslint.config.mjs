import next from "eslint-config-next";

export default [
  ...next,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      "*.config.js",
      "jest.config.js",
      "jest.setup.js",
      "prisma/seed.ts",
    ],
    rules: {
      "import/no-anonymous-default-export": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
];
