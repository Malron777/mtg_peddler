import { buildDb } from "../infra/db/db";
import { buildAppConfig } from "./build-app-config";

// Card domain use cases
import { CardsUseCase } from "../app/use cases/card/cards.use-case";
import { PriceHistoryUseCase } from "../app/use cases/card/price-history.use-case";

// Collection domain use cases
import { CollectionItemsUseCase } from "../app/use cases/collection/collection-items.use-case";
import { CollectionsUseCase } from "../app/use cases/collection/collections.use-case";
import { WantListItemsUseCase } from "../app/use cases/collection/want-list-items.use-case";
import { WantListsUseCase } from "../app/use cases/collection/want-lists.use-case";

// Deals domain use cases
import { DealItemsUseCase } from "../app/use cases/deals/deal-items.use-case";
import { DealsUseCase } from "../app/use cases/deals/deals.use-case";

// Report domain use cases
import { UserReportsUseCase } from "../app/use cases/report/user-reports.use-case";

// Store domain use cases
import { PromotionsUseCase } from "../app/use cases/store/promotions.use-case";
import { StoreStaffUseCase } from "../app/use cases/store/store-staff.use-case";
import { StoresUseCase } from "../app/use cases/store/stores.use-case";

// User domain use cases
import { LocationsUseCase } from "../app/use cases/user/locations.use-case";
import { MessagesUseCase } from "../app/use cases/user/messages.use-case";
import { NotificationsUseCase } from "../app/use cases/user/notifications.use-case";
import { PaymentMethodsUseCase } from "../app/use cases/user/payment-methods.use-case";
import { UsersUseCase } from "../app/use cases/user/users.use-case";

function buildDependencyContainer() {
  const config = buildAppConfig();
  //const logger: AppLogger = buildLogger();
  const db = buildDb(config.DATABASE_URL);

  // You could include groups here like repos and use cases
  // const repos = {
  //    xRepo: new XRepo(db),
  // }

  // Use cases
  const cardsUseCase = new CardsUseCase(db);
  const priceHistoryUseCase = new PriceHistoryUseCase(db);
  const collectionsUseCase = new CollectionsUseCase(db);
  const collectionItemsUseCase = new CollectionItemsUseCase(db);
  const wantListsUseCase = new WantListsUseCase(db);
  const wantListItemsUseCase = new WantListItemsUseCase(db);
  const dealsUseCase = new DealsUseCase(db);
  const dealItemsUseCase = new DealItemsUseCase(db);
  const userReportsUseCase = new UserReportsUseCase(db);
  const storesUseCase = new StoresUseCase(db);
  const storeStaffUseCase = new StoreStaffUseCase(db);
  const promotionsUseCase = new PromotionsUseCase(db);
  const usersUseCase = new UsersUseCase(db);
  const locationsUseCase = new LocationsUseCase(db);
  const paymentMethodsUseCase = new PaymentMethodsUseCase(db);
  const messagesUseCase = new MessagesUseCase(db);
  const notificationsUseCase = new NotificationsUseCase(db);

  return {
    db,
    config,
    useCases: {
      // Card domain
      cards: cardsUseCase,
      priceHistory: priceHistoryUseCase,

      // Collection domain
      collections: collectionsUseCase,
      collectionItems: collectionItemsUseCase,
      wantLists: wantListsUseCase,
      wantListItems: wantListItemsUseCase,

      // Deals domain
      deals: dealsUseCase,
      dealItems: dealItemsUseCase,

      // Report domain
      userReports: userReportsUseCase,

      // Store domain
      stores: storesUseCase,
      storeStaff: storeStaffUseCase,
      promotions: promotionsUseCase,

      // User domain
      users: usersUseCase,
      locations: locationsUseCase,
      paymentMethods: paymentMethodsUseCase,
      messages: messagesUseCase,
      notifications: notificationsUseCase,
    },
  };
}

export type DependencyContainer = ReturnType<typeof buildDependencyContainer>;
export const dependencies = buildDependencyContainer();
