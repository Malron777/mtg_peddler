import { buildDb } from "../infra/db/db";
import { buildAppConfig } from "./build-app-config";

function buildDependencyContainer() {
  const config = buildAppConfig();
  //const logger: AppLogger = buildLogger();
  const db = buildDb(config.DATABASE_URL);

  // You could include groups here like repos and use cases
  // const repos = {
  //    xRepo: new XRepo(db),
  // }

  return {
    db,
    config,
  };
}

export type DependencyContainer = ReturnType<typeof buildDependencyContainer>;
export const dependencies = buildDependencyContainer();
