import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { wantListItemTestFactory } from "@/src/domain/tcg/want-list-item.model.test-factory";
import { wantListTestFactory } from "@/src/domain/tcg/want-list.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getWantListMatchesQuery } from "./get-want-list-matches.query";

describe("getWantListMatchesQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should find collections that match want list items", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const wantListUser = await userTestFactory.buildAndInsertOne(db, {
        email: "wantlist@example.com",
        name: "Want List User",
      });

      const collectionOwner = await userTestFactory.buildAndInsertOne(db, {
        email: "owner@example.com",
        name: "Collection Owner",
      });

      // Create want list
      const wantList = await wantListTestFactory.buildAndInsertOne(db, {
        userId: wantListUser.id,
        name: "My Want List",
      });

      // Create test cards
      const card1 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      const card2 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-2",
        oracleId: "oracle-2",
        name: "Counterspell",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create want list items
      await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: wantList.id,
        cardScryfallId: card1.scryfallId,
        quantityWanted: 2,
        conditionMinimum: "NM",
      });

      await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: wantList.id,
        cardScryfallId: card2.scryfallId,
        quantityWanted: 1,
        conditionMinimum: "LP",
      });

      // Create public collection with matching cards
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: collectionOwner.id,
        name: "Public Collection",
        isPublic: true,
      });

      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card1.scryfallId,
        quantity: 3,
        condition: "NM",
        isFoil: false,
        listingType: "trade",
      });

      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card2.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: false,
        listingType: "sale",
      });

      const result = await getWantListMatchesQuery(db, {
        wantListId: wantList.id,
      });

      expect(result.matches).toHaveLength(1);
      expect(result.totalMatches).toBe(2);

      const match = result.matches[0];
      expect(match.collectionId).toBe(collection.id);
      expect(match.collectionName).toBe("Public Collection");
      expect(match.collectionOwnerId).toBe(collectionOwner.id);
      expect(match.collectionOwnerName).toBe("Collection Owner");
      expect(match.isPublic).toBe(true);
      expect(match.matchingCards).toHaveLength(2);

      const card1Match = match.matchingCards.find(
        (c) => c.cardScryfallId === card1.scryfallId
      );
      const card2Match = match.matchingCards.find(
        (c) => c.cardScryfallId === card2.scryfallId
      );

      expect(card1Match?.wantedQuantity).toBe(2);
      expect(card1Match?.availableQuantity).toBe(3);
      expect(card1Match?.cardName).toBe("Lightning Bolt");

      expect(card2Match?.wantedQuantity).toBe(1);
      expect(card2Match?.availableQuantity).toBe(1);
      expect(card2Match?.cardName).toBe("Counterspell");
    });
  });

  it("should exclude private collections by default", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const wantListUser = await userTestFactory.buildAndInsertOne(db, {
        email: "wantlist@example.com",
        name: "Want List User",
      });

      const collectionOwner = await userTestFactory.buildAndInsertOne(db, {
        email: "owner@example.com",
        name: "Collection Owner",
      });

      // Create want list
      const wantList = await wantListTestFactory.buildAndInsertOne(db, {
        userId: wantListUser.id,
        name: "My Want List",
      });

      // Create test card
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create want list item
      await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: wantList.id,
        cardScryfallId: card.scryfallId,
        quantityWanted: 1,
        conditionMinimum: "NM",
      });

      // Create private collection with matching card
      const privateCollection = await collectionTestFactory.buildAndInsertOne(
        db,
        {
          userId: collectionOwner.id,
          name: "Private Collection",
          isPublic: false,
        }
      );

      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: privateCollection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: false,
        listingType: "trade",
      });

      const result = await getWantListMatchesQuery(db, {
        wantListId: wantList.id,
      });

      expect(result.matches).toHaveLength(0);
      expect(result.totalMatches).toBe(0);
    });
  });

  it("should include private collections when includePrivateCollections is true", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const wantListUser = await userTestFactory.buildAndInsertOne(db, {
        email: "wantlist@example.com",
        name: "Want List User",
      });

      const collectionOwner = await userTestFactory.buildAndInsertOne(db, {
        email: "owner@example.com",
        name: "Collection Owner",
      });

      // Create want list
      const wantList = await wantListTestFactory.buildAndInsertOne(db, {
        userId: wantListUser.id,
        name: "My Want List",
      });

      // Create test card
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create want list item
      await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: wantList.id,
        cardScryfallId: card.scryfallId,
        quantityWanted: 1,
        conditionMinimum: "NM",
      });

      // Create private collection with matching card
      const privateCollection = await collectionTestFactory.buildAndInsertOne(
        db,
        {
          userId: collectionOwner.id,
          name: "Private Collection",
          isPublic: false,
        }
      );

      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: privateCollection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: false,
        listingType: "trade",
      });

      const result = await getWantListMatchesQuery(db, {
        wantListId: wantList.id,
        includePrivateCollections: true,
      });

      expect(result.matches).toHaveLength(1);
      expect(result.totalMatches).toBe(1);

      const match = result.matches[0];
      expect(match.collectionId).toBe(privateCollection.id);
      expect(match.isPublic).toBe(false);
    });
  });

  it("should return empty result when no want list items exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getWantListMatchesQuery(db, {
        wantListId: "non-existent-want-list",
      });

      expect(result.matches).toHaveLength(0);
      expect(result.totalMatches).toBe(0);
    });
  });

  it("should handle multiple collections with matches", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const wantListUser = await userTestFactory.buildAndInsertOne(db, {
        email: "wantlist@example.com",
        name: "Want List User",
      });
      const owner1 = await userTestFactory.buildAndInsertOne(db, {
        email: "owner1@example.com",
        name: "Owner 1",
      });
      const owner2 = await userTestFactory.buildAndInsertOne(db, {
        email: "owner2@example.com",
        name: "Owner 2",
      });

      // Create want list
      const wantList = await wantListTestFactory.buildAndInsertOne(db, {
        userId: wantListUser.id,
        name: "My Want List",
      });
      // Create test card
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
      });
      // Create want list item
      await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: wantList.id,
        cardScryfallId: card.scryfallId,
        quantityWanted: 1,
        conditionMinimum: "NM",
      });

      // Create two collections with matching cards
      const collection1 = await collectionTestFactory.buildAndInsertOne(db, {
        userId: owner1.id,
        name: "Collection 1",
        isPublic: true,
      });
      const collection2 = await collectionTestFactory.buildAndInsertOne(db, {
        userId: owner2.id,
        name: "Collection 2",
        isPublic: true,
      });
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection1.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: false,
        listingType: "trade",
      });
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection2.id,
        cardScryfallId: card.scryfallId,
        quantity: 2,
        condition: "NM",
        isFoil: false,
        listingType: "sale",
      });

      const result = await getWantListMatchesQuery(db, {
        wantListId: wantList.id,
      });

      expect(result.matches).toHaveLength(2);
      expect(result.totalMatches).toBe(2);

      const collection1Match = result.matches.find(
        (m) => m.collectionId === collection1.id
      );
      const collection2Match = result.matches.find(
        (m) => m.collectionId === collection2.id
      );

      expect(collection1Match?.collectionOwnerName).toBe("Owner 1");
      expect(collection2Match?.collectionOwnerName).toBe("Owner 2");
    });
  });
});
