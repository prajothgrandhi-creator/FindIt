import "server-only";
import { MongoClient, type Db } from "mongodb";
import { PES_UNIVERSITY_ID } from "@/lib/registration/schema";
import type { UniversityDocument } from "@/lib/mongodb/types";

const globalForMongo = globalThis as typeof globalThis & {
  findItMongoClient?: Promise<MongoClient>;
  findItMongoDatabase?: Promise<Db>;
};
export function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  if (!globalForMongo.findItMongoClient) {
    globalForMongo.findItMongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    }).connect().catch((error: unknown) => {
      globalForMongo.findItMongoClient = undefined;
      throw error;
    });
  }
  return globalForMongo.findItMongoClient;
}

export async function getDatabase(): Promise<Db> {
  const databaseName = process.env.MONGODB_DB_NAME;
  if (!databaseName) throw new Error("MONGODB_DB_NAME is not configured.");

  if (!globalForMongo.findItMongoDatabase) {
    globalForMongo.findItMongoDatabase = getMongoClient().then(async (client) => {
      const db = client.db(databaseName);
      await Promise.all([
        db.collection("universities").createIndex({ slug: 1 }, { unique: true }),
        db.collection("student_roster").createIndex(
          { universityId: 1, normalizedSrn: 1 },
          { unique: true, name: "roster_university_srn_unique" },
        ),
        db.collection("student_profiles").createIndex(
          { universityId: 1, normalizedSrn: 1 },
          { unique: true, name: "profile_university_srn_unique" },
        ),
        db.collection("student_profiles").createIndex({ email: 1 }),
        db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
        db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
      await db.collection<UniversityDocument>("universities").updateOne(
        { _id: PES_UNIVERSITY_ID },
        {
          $setOnInsert: {
            name: "PES University",
            slug: "pes-university",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );
      return db;
    }).catch((error: unknown) => {
      globalForMongo.findItMongoDatabase = undefined;
      throw error;
    });
  }
  return globalForMongo.findItMongoDatabase;
}
