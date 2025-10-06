import {
  boolean,
  decimal,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { stores, user } from "./auth";

// Enums
export const cardConditionEnum = pgEnum("card_condition", [
  "NM",
  "LP",
  "MP",
  "HP",
  "DMG",
]);
export const listingTypeEnum = pgEnum("listing_type", [
  "trade",
  "sale",
  "both",
]);
export const locationTypeEnum = pgEnum("location_type", [
  "store",
  "pudo",
  "postnet",
  "address",
]);
export const paymentMethodTypeEnum = pgEnum("payment_method_type", [
  "bank_transfer",
  "cash",
]);
export const dealStatusEnum = pgEnum("deal_status", [
  "negotiating",
  "accepted",
  "payment_pending",
  "shipped",
  "completed",
  "rejected",
  "expired",
  "disputed",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "deal_update",
  "message",
  "system",
  "promotion",
]);
export const priceSourceEnum = pgEnum("price_source", [
  "tcg",
  "scg",
  "custom",
  "mtggoldfish",
  "cardmarket",
]);

// Cards table (cached from Scryfall)
export const cards = pgTable(
  "cards",
  {
    scryfallId: text("scryfall_id").primaryKey(),
    oracleId: text("oracle_id").notNull(),
    name: text("name").notNull(),
    setCode: text("set_code").notNull(),
    setName: text("set_name").notNull(),
    imageUris: json("image_uris").$type<Record<string, string>>(),
    pricesLastUpdated: timestamp("prices_last_updated"),
    cachedData: json("cached_data").$type<Record<string, unknown>>(),
    lastFetchedAt: timestamp("last_fetched_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    oracleIdIdx: index("cards_oracle_id_idx").on(table.oracleId),
    setNameIdx: index("cards_set_name_idx").on(table.setName),
  })
);

// Collections
export const collections = pgTable(
  "collections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("collections_user_id_idx").on(table.userId),
  })
);

// Collection Items
export const collectionItems = pgTable(
  "collection_items",
  {
    id: text("id").primaryKey(),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    cardScryfallId: text("card_scryfall_id")
      .notNull()
      .references(() => cards.scryfallId, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    condition: cardConditionEnum("condition").notNull(),
    language: text("language").default("en").notNull(),
    isFoil: boolean("is_foil").default(false).notNull(),
    listingType: listingTypeEnum("listing_type").notNull(),
    customPrice: decimal("custom_price", { precision: 10, scale: 2 }),
    priceSource: priceSourceEnum("price_source").default("tcg").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    collectionIdIdx: index("collection_items_collection_id_idx").on(
      table.collectionId
    ),
    cardScryfallIdIdx: index("collection_items_card_scryfall_id_idx").on(
      table.cardScryfallId
    ),
  })
);

// Want Lists
export const wantLists = pgTable(
  "want_lists",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    priority: integer("priority").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("want_lists_user_id_idx").on(table.userId),
  })
);

// Want List Items
export const wantListItems = pgTable(
  "want_list_items",
  {
    id: text("id").primaryKey(),
    wantListId: text("want_list_id")
      .notNull()
      .references(() => wantLists.id, { onDelete: "cascade" }),
    cardScryfallId: text("card_scryfall_id")
      .notNull()
      .references(() => cards.scryfallId, { onDelete: "cascade" }),
    quantityWanted: integer("quantity_wanted").notNull().default(1),
    maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
    conditionMinimum: cardConditionEnum("condition_minimum").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    wantListIdIdx: index("want_list_items_want_list_id_idx").on(
      table.wantListId
    ),
    cardScryfallIdIdx: index("want_list_items_card_scryfall_id_idx").on(
      table.cardScryfallId
    ),
  })
);

// Locations
export const locations = pgTable(
  "locations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: locationTypeEnum("type").notNull(),
    name: text("name").notNull(),
    addressDetails: json("address_details").$type<Record<string, unknown>>(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("locations_user_id_idx").on(table.userId),
  })
);

// Payment Methods
export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: paymentMethodTypeEnum("type").notNull(),
    details: json("details").$type<Record<string, unknown>>(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("payment_methods_user_id_idx").on(table.userId),
  })
);

// Deals
export const deals = pgTable(
  "deals",
  {
    id: text("id").primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: dealStatusEnum("status").default("negotiating").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethodId: text("payment_method_id").references(
      () => paymentMethods.id,
      { onDelete: "set null" }
    ),
    shippingLocationId: text("shipping_location_id").references(
      () => locations.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    finalizedAt: timestamp("finalized_at"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    sellerIdIdx: index("deals_seller_id_idx").on(table.sellerId),
    buyerIdIdx: index("deals_buyer_id_idx").on(table.buyerId),
    statusIdx: index("deals_status_idx").on(table.status),
  })
);

// Deal Items
export const dealItems = pgTable(
  "deal_items",
  {
    id: text("id").primaryKey(),
    dealId: text("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    collectionItemId: text("collection_item_id")
      .notNull()
      .references(() => collectionItems.id, { onDelete: "cascade" }),
    agreedPrice: decimal("agreed_price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    dealIdIdx: index("deal_items_deal_id_idx").on(table.dealId),
    collectionItemIdIdx: index("deal_items_collection_item_id_idx").on(
      table.collectionItemId
    ),
  })
);

// Messages
export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    dealId: text("deal_id").references(() => deals.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    dealIdIdx: index("messages_deal_id_idx").on(table.dealId),
    senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
    recipientIdIdx: index("messages_recipient_id_idx").on(table.recipientId),
  })
);

// Notifications
export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    relatedEntityType: text("related_entity_type"),
    relatedEntityId: text("related_entity_id"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  })
);

// Price History
export const priceHistory = pgTable(
  "price_history",
  {
    id: text("id").primaryKey(),
    cardScryfallId: text("card_scryfall_id")
      .notNull()
      .references(() => cards.scryfallId, { onDelete: "cascade" }),
    source: priceSourceEnum("source").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD").notNull(),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    cardScryfallIdIdx: index("price_history_card_scryfall_id_idx").on(
      table.cardScryfallId
    ),
    sourceIdx: index("price_history_source_idx").on(table.source),
    fetchedAtIdx: index("price_history_fetched_at_idx").on(table.fetchedAt),
  })
);

// Promotions
export const promotions = pgTable(
  "promotions",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    discountPercentage: decimal("discount_percentage", {
      precision: 5,
      scale: 2,
    }),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at").notNull(),
    collectionId: text("collection_id").references(() => collections.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    storeIdIdx: index("promotions_store_id_idx").on(table.storeId),
    startsAtIdx: index("promotions_starts_at_idx").on(table.startsAt),
    endsAtIdx: index("promotions_ends_at_idx").on(table.endsAt),
  })
);
