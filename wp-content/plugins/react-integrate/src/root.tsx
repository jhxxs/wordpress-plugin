import { Theme } from "@radix-ui/themes"
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"
import { isWP } from "./constants"

// jotai
import { createStore, Provider } from "jotai"
import { DevTools } from "jotai-devtools"
import "jotai-devtools/styles.css"
import "./index.css"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

const store = createStore()

export default function Root() {
  return (
    <Provider store={store}>
      <DevTools theme="dark" position="bottom-right" />
      <Theme className={isWP ? "is-wordpress" : ""}>
        <div className="flex w-full h-[calc(100vh-var(--abh))]">
          <Outlet />
        </div>
      </Theme>
    </Provider>
  )
}

export function ErrorBoundary() {
  return <div>Error</div>
}

export function HydrateFallback() {
  return (
    <div className="flex w-full h-[calc(100vh-var(--abh))] items-center justify-center">
      Loading...
    </div>
  )
}
