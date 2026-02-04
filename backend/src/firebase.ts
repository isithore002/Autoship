import admin from "firebase-admin"
import "dotenv/config"
import { env } from "../src/config/env"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY
    }),
    databaseURL: env.FIREBASE_DATABASE_URL
  })
}

export const db = admin.firestore()

if (process.env.NODE_ENV === "test") {
  db.settings({ host: "localhost:8080", ssl: false })
}