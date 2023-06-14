import type { ImportableTheme } from "../../utils/pg";

const THEMES: ImportableTheme[] = [
  { name: "Dracula", importTheme: () => import("./dracula") },
  { name: "Solana", importTheme: () => import("./solana") },
  { name: "Playground", importTheme: () => import("./playground") },
  { name: "Light", importTheme: () => import("./light") },
];

export default THEMES;
