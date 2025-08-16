import {
  AppDistribution,
  LATEST_API_VERSION, // Hum isey ab use nahi karenge
  ApiVersion,         // Highlight: Isko import karein
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-07";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",

  // Highlight: API Version ko hardcode karein
  apiVersion: ApiVersion.October24,

  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  isEmbeddedApp: true,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  // ...and other configuration details you might have.
});

export default shopify;
export const apiVersion = ApiVersion.October24; // Highlight: Yahan bhi update karein
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
