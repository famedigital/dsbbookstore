export const STOREFRONT_THEMES = [
  {
    id: "uikit",
    name: "Books Store UI Kit",
    description:
      "Modern app & website kit — soft indigo, rounded cards, clean discovery layout (Figma UI Kit style).",
    figma:
      "https://www.figma.com/community/file/1372186800683735461/books-store-app-website-ui-kit",
  },
  {
    id: "booksaw",
    name: "Booksaw",
    description:
      "Elegant bookstore ecommerce — warm taupe accent, parchment ground, classic serif headings.",
    figma:
      "https://www.figma.com/community/file/1521831984874247291/booksaw-bookstore-ecommerce-website-design-template",
  },
  {
    id: "booketic",
    name: "Booketic",
    description:
      "Fully responsive online bookshop — bright white, sky accent, soft product grids.",
    figma:
      "https://www.figma.com/community/file/1639269166596216371/booketic-a-fully-responsive-online-bookshop",
  },
  {
    id: "atelier",
    name: "Atelier Lacquer",
    description:
      "Editorial luxury — ink, ivory, lacquer red and gilt (previous DSB atelier look).",
    figma: null,
  },
] as const;

export type StorefrontThemeId = (typeof STOREFRONT_THEMES)[number]["id"];

export const DEFAULT_STOREFRONT_THEME: StorefrontThemeId = "uikit";

export function isStorefrontThemeId(value: string): value is StorefrontThemeId {
  return STOREFRONT_THEMES.some((t) => t.id === value);
}

export function resolveStorefrontTheme(
  value: string | null | undefined,
): StorefrontThemeId {
  if (value && isStorefrontThemeId(value)) return value;
  return DEFAULT_STOREFRONT_THEME;
}
