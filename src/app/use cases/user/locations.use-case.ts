import {
  InsertLocation,
  UpdateLocation,
} from "@/src/domain/tcg/location.model";
import { DB } from "@/src/infra/db/db";
import { createLocationQuery } from "@/src/infra/repos/user/create-location.query";
import { deleteLocationQuery } from "@/src/infra/repos/user/delete-location.query";
import { getAllLocationsForUserQuery } from "@/src/infra/repos/user/get-all-locations-for-user.query";
import { getAllLocationsQuery } from "@/src/infra/repos/user/get-all-locations.query";
import { getLocationQuery } from "@/src/infra/repos/user/get-location.query";
import { updateLocationQuery } from "@/src/infra/repos/user/update-location.query";

export class LocationsUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async createLocation(insertLocation: InsertLocation) {
    return createLocationQuery(this.db, insertLocation);
  }

  async getLocation(locationId: string) {
    return getLocationQuery(this.db, locationId);
  }

  async getAllLocations() {
    return getAllLocationsQuery(this.db);
  }

  async getAllLocationsForUser(userId: string) {
    return getAllLocationsForUserQuery(this.db, userId);
  }

  async updateLocation(updateData: UpdateLocation) {
    return updateLocationQuery(this.db, updateData);
  }

  async deleteLocation(locationId: string) {
    return deleteLocationQuery(this.db, locationId);
  }
}
