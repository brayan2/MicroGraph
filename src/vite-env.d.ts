/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HYGRAPH_ENDPOINT: string;
  readonly VITE_HYGRAPH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

