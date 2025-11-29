const ICONS = {
  sol: "/icons/sol.png"
} as const;

export type TokenIconImg = keyof typeof ICONS;

export const getTokenIconImg = (token: TokenIconImg) => {
  return ICONS[token] ?? "/icons/sol.png";
}
