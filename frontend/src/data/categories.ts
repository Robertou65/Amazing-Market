import { apiService } from "../lib/api";

export type CategorySlug = "wines_spirits";

type Subcategory = {
  name: string;
  image: string;
};

export type MarketCategory = {
  slug: CategorySlug;
  name: string;
  image: string;
  subcategories: Subcategory[];
};

function getCategoryAssetUrl(filename: string): string {
  return apiService.getImageUrl(`/assets/categories/${filename}`);
}

export const categories: MarketCategory[] = [
  {
    slug: "wines_spirits",
    name: "Wines and Spirits",
    image: getCategoryAssetUrl("wines_category.webp"),
    subcategories: [
      { name: "Wines", image: getCategoryAssetUrl("wines_category.webp") },
      { name: "Whiskey", image: getCategoryAssetUrl("whiskey_category.webp") },
      { name: "Beer", image: getCategoryAssetUrl("beer_category.webp") },
      { name: "Tequila", image: getCategoryAssetUrl("tequila_category.webp") },
      { name: "Vodka", image: getCategoryAssetUrl("vodka_category.webp") },
      { name: "Gin", image: getCategoryAssetUrl("gin_category.webp") },
      { name: "Cognac - Brandy", image: getCategoryAssetUrl("cognac_category.webp") },
      { name: "Rum", image: getCategoryAssetUrl("rum_category.webp") },
      { name: "Schnapps", image: getCategoryAssetUrl("schnapps_category.webp") }
    ]
  }
];

export function getCategoryBySlug(slug: string | undefined): MarketCategory | undefined {
  if (!slug) {
    return undefined;
  }

  return categories.find((category) => category.slug === slug);
}
