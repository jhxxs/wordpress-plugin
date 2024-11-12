import { defineConfig } from "vite"
import liveReload from "vite-plugin-live-reload"
import UnoCSS from "unocss/vite"
import Icons from "unplugin-icons/vite"
import react from "@vitejs/plugin-react"
import AutoImport from "unplugin-auto-import/vite"
import wyw from "@wyw-in-js/vite"
import path from "node:path"
import { codeInspectorPlugin } from "code-inspector-plugin"
import jotaiDebugLabel from "jotai/babel/plugin-debug-label"
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh"

export default defineConfig(({ mode, command }) => {
  const isWordpress = mode === "wordpress"
  return {
    plugins: [
      codeInspectorPlugin({
        bundler: "vite",
        editor: "cursor",
        hideDomPathAttr: true
      }),
      UnoCSS(),
      Icons({
        autoInstall: true,
        compiler: "jsx",
        jsx: "react"
      }),
      react({
        babel: {
          presets: ["jotai/babel/preset"],
          plugins: [jotaiDebugLabel, jotaiReactRefresh]
        }
      }),
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
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    root: isWordpress ? "src" : "",
    base: isWordpress ? "" : command === "serve" ? "" : "/dist/",
    build: {
      manifest: true,
      outDir: "../public/dist",
      emptyOutDir: true,
      rollupOptions: {
        input: "src/main.tsx",
        output: {
          assetFileNames: () => {
            return "assets/[name][extname]"
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
