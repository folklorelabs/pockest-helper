/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string
  readonly VITE_DISCORD_WEBHOOK_MATCH: string
  readonly VITE_DISCORD_WEBHOOK_EVO: string
  readonly VITE_DISCORD_WEBHOOK_TEST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}