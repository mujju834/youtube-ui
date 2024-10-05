import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  define: {
    // Expose environment variables to the client
    'process.env.REACT_APP_BACKEND_API': JSON.stringify(process.env.REACT_APP_BACKEND_API || "http://localhost:3000"),
  },
});
