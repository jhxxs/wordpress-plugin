import { defineConfig } from "vite"
import liveReload from "vite-plugin-live-reload"
import UnoCSS from "unocss/vite"
import Icons from "unplugin-icons/vite"
import react from "@vitejs/plugin-react"
import AutoImport from "unplugin-auto-import/vite"
import wyw from "@wyw-in-js/vite"

export default defineConfig(({ mode, command }) => {
  const isWordpress = mode === "wordpress"
  return {
    plugins: [
      UnoCSS(),
      Icons({
        autoInstall: true,
        compiler: "jsx",
        jsx: "react"
      }),
      react(),
      wyw(),
      AutoImport({
        imports: [
          "react",
          "react-router-dom",
          {
            from: "clsx",
            imports: ["clsx"]
          },
          {
            from: "@linaria/core",
            imports: ["css", "cx"]
          }
        ]
      }),
      liveReload([`${__dirname}/*.php`, `${__dirname}/**/*.php`])
    ],
    root: isWordpress ? "src" : "",
    base: isWordpress ? "" : command === "serve" ? "" : "/dist/",
    build: {
      manifest: true,
      outDir: "../public/dist",
      emptyOutDir: true,
      rollupOptions: {
        input: "src/main.tsx",
        output: {
          manualChunks(id) {
            // all third-party code will be in vendor chunk
            if (id.includes("node_modules")) {
              return "vendor"
            }
            // example on how to create another chunk
            // if (id.includes('src/'components')) {
            //   return 'components'
            // }
            // console.log(id)
          }
        }
      }
    },
    server: {
      port: isWordpress ? 8880 : undefined,
      strictPort: true
    }
  }
})
