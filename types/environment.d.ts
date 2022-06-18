export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTION_CLIENT_ID: string;
      NOTION_INTEGRATION_SECRET: string;
      NETLIFY_FUNCTIONS_BASE: string;
    }
  }
}
