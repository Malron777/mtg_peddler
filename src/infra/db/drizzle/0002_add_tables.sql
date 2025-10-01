CREATE TYPE "public"."card_condition" AS ENUM('NM', 'LP', 'MP', 'HP', 'DMG');--> statement-breakpoint
CREATE TYPE "public"."deal_status" AS ENUM('negotiating', 'accepted', 'payment_pending', 'shipped', 'completed', 'rejected', 'expired', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('trade', 'sale', 'both');--> statement-breakpoint
CREATE TYPE "public"."location_type" AS ENUM('store', 'pudo', 'postnet', 'address');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('deal_update', 'message', 'system', 'promotion');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('bank_transfer', 'cash');--> statement-breakpoint
CREATE TYPE "public"."price_source" AS ENUM('tcg', 'scg', 'custom', 'mtggoldfish', 'cardmarket');--> statement-breakpoint
CREATE TABLE "store_staff" (
	"store_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "store_staff_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_staff_store_id_user_id_pk" PRIMARY KEY("store_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website_url" text,
	"physical_address" text,
	"description" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"reported_user_id" text NOT NULL,
	"deal_id" text,
	"reason" text NOT NULL,
	"description" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"scryfall_id" text PRIMARY KEY NOT NULL,
	"oracle_id" text NOT NULL,
	"name" text NOT NULL,
	"set_code" text NOT NULL,
	"set_name" text NOT NULL,
	"image_uris" json,
	"prices_last_updated" timestamp,
	"cached_data" json,
	"last_fetched_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_items" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_id" text NOT NULL,
	"card_scryfall_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"condition" "card_condition" NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"is_foil" boolean DEFAULT false NOT NULL,
	"listing_type" "listing_type" NOT NULL,
	"custom_price" numeric(10, 2),
	"price_source" "price_source" DEFAULT 'tcg' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deal_items" (
	"id" text PRIMARY KEY NOT NULL,
	"deal_id" text NOT NULL,
	"collection_item_id" text NOT NULL,
	"agreed_price" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"status" "deal_status" DEFAULT 'negotiating' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method_id" text,
	"shipping_location_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"finalized_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "location_type" NOT NULL,
	"name" text NOT NULL,
	"address_details" json,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"deal_id" text,
	"sender_id" text NOT NULL,
	"recipient_id" text,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"related_entity_type" text,
	"related_entity_id" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "payment_method_type" NOT NULL,
	"details" json,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" text PRIMARY KEY NOT NULL,
	"card_scryfall_id" text NOT NULL,
	"source" "price_source" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"discount_percentage" numeric(5, 2),
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"collection_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "want_list_items" (
	"id" text PRIMARY KEY NOT NULL,
	"want_list_id" text NOT NULL,
	"card_scryfall_id" text NOT NULL,
	"quantity_wanted" integer DEFAULT 1 NOT NULL,
	"max_price" numeric(10, 2),
	"condition_minimum" "card_condition" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "want_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"priority" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_staff" ADD CONSTRAINT "store_staff_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_staff" ADD CONSTRAINT "store_staff_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reported_user_id_user_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_card_scryfall_id_cards_scryfall_id_fk" FOREIGN KEY ("card_scryfall_id") REFERENCES "public"."cards"("scryfall_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_items" ADD CONSTRAINT "deal_items_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_items" ADD CONSTRAINT "deal_items_collection_item_id_collection_items_id_fk" FOREIGN KEY ("collection_item_id") REFERENCES "public"."collection_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_shipping_location_id_locations_id_fk" FOREIGN KEY ("shipping_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_card_scryfall_id_cards_scryfall_id_fk" FOREIGN KEY ("card_scryfall_id") REFERENCES "public"."cards"("scryfall_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "want_list_items" ADD CONSTRAINT "want_list_items_want_list_id_want_lists_id_fk" FOREIGN KEY ("want_list_id") REFERENCES "public"."want_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "want_list_items" ADD CONSTRAINT "want_list_items_card_scryfall_id_cards_scryfall_id_fk" FOREIGN KEY ("card_scryfall_id") REFERENCES "public"."cards"("scryfall_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "want_lists" ADD CONSTRAINT "want_lists_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cards_oracle_id_idx" ON "cards" USING btree ("oracle_id");--> statement-breakpoint
CREATE INDEX "cards_set_name_idx" ON "cards" USING btree ("set_name");--> statement-breakpoint
CREATE INDEX "collection_items_collection_id_idx" ON "collection_items" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_items_card_scryfall_id_idx" ON "collection_items" USING btree ("card_scryfall_id");--> statement-breakpoint
CREATE INDEX "collections_user_id_idx" ON "collections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deal_items_deal_id_idx" ON "deal_items" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "deal_items_collection_item_id_idx" ON "deal_items" USING btree ("collection_item_id");--> statement-breakpoint
CREATE INDEX "deals_seller_id_idx" ON "deals" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "deals_buyer_id_idx" ON "deals" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "deals_status_idx" ON "deals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "locations_user_id_idx" ON "locations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "messages_deal_id_idx" ON "messages" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_recipient_id_idx" ON "messages" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "payment_methods_user_id_idx" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "price_history_card_scryfall_id_idx" ON "price_history" USING btree ("card_scryfall_id");--> statement-breakpoint
CREATE INDEX "price_history_source_idx" ON "price_history" USING btree ("source");--> statement-breakpoint
CREATE INDEX "price_history_fetched_at_idx" ON "price_history" USING btree ("fetched_at");--> statement-breakpoint
CREATE INDEX "promotions_store_id_idx" ON "promotions" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "promotions_starts_at_idx" ON "promotions" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "promotions_ends_at_idx" ON "promotions" USING btree ("ends_at");--> statement-breakpoint
CREATE INDEX "want_list_items_want_list_id_idx" ON "want_list_items" USING btree ("want_list_id");--> statement-breakpoint
CREATE INDEX "want_list_items_card_scryfall_id_idx" ON "want_list_items" USING btree ("card_scryfall_id");--> statement-breakpoint
CREATE INDEX "want_lists_user_id_idx" ON "want_lists" USING btree ("user_id");