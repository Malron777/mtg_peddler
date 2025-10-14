import { ScryfallCard } from "@/src/app/services/scryfall.service";
import { Card } from "@/src/domain/tcg/card.model";

/**
 * Gets the appropriate image URL for a card, handling both single-faced and double-faced cards
 * @param card - The card from our database
 * @param scryfallCard - Optional Scryfall card data (for when we have fresh data)
 * @param size - The desired image size ('small', 'normal', 'large', 'png', 'art_crop', 'border_crop')
 * @returns The image URL or null if no image is available
 */
export function getCardImageUrl(
  card: Card,
  scryfallCard?: ScryfallCard,
  size:
    | "small"
    | "normal"
    | "large"
    | "png"
    | "art_crop"
    | "border_crop" = "normal"
): string | null {
  // First try the card's stored imageUris
  if (card.imageUris?.[size]) {
    return card.imageUris[size];
  }

  // If we have fresh Scryfall data, check its image_uris
  if (scryfallCard?.image_uris?.[size]) {
    return scryfallCard.image_uris[size];
  }

  // For 2-faced cards, check the first face's image_uris
  if (scryfallCard?.card_faces?.[0]?.image_uris?.[size]) {
    return scryfallCard.card_faces[0].image_uris[size];
  }

  // If we have cached data, check it for card_faces
  if (card.cachedData && typeof card.cachedData === "object") {
    const cachedData = card.cachedData as any;
    if (cachedData.card_faces?.[0]?.image_uris?.[size]) {
      return cachedData.card_faces[0].image_uris[size];
    }
  }

  return null;
}

/**
 * Gets the fallback image URL for a card, trying multiple sizes and sources
 * @param card - The card from our database
 * @param scryfallCard - Optional Scryfall card data
 * @returns The best available image URL or null
 */
export function getCardImageFallback(
  card: Card,
  scryfallCard?: ScryfallCard
): string | null {
  // Try different sizes in order of preference
  const sizes: Array<
    "normal" | "small" | "large" | "png" | "art_crop" | "border_crop"
  > = ["normal", "small", "large", "png", "art_crop", "border_crop"];

  for (const size of sizes) {
    const url = getCardImageUrl(card, scryfallCard, size);
    if (url) {
      return url;
    }
  }

  return null;
}
