/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  /** Região das Cloud Functions callable (ex.: southamerica-east1). */
  readonly VITE_FIREBASE_FUNCTIONS_REGION?: string
  /** `1` = usar `/fbfunctions/*` no Hosting (domínio próprio sem .web.app). */
  readonly VITE_FUNCTIONS_USE_HOSTING_PROXY?: string
  /** Token público do Mapbox (pk....) para geocodificação precisa do mapa de cobertura. */
  readonly VITE_MAPBOX_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
