import { Theme } from "@radix-ui/themes"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom"
import { isWP, rootRouteId } from "./constants.ts"
import ErrorPage from "./error-page.tsx"
import Contact, {
  action as contactAction,
  loader as contactLoader
} from "./routes/contacts.tsx"
import { action as destroyAction } from "./routes/destroy.tsx"
import EditContact, { action as editAction } from "./routes/edit.tsx"
import { FabricDemo } from "./routes/fabric-demo.tsx"
import { FabricDemo as KonvaDemo } from "./routes/konva.tsx"
import Index from "./routes/index.tsx"
import Root, {
  action as rootAction,
  loader as rootLoader
} from "./routes/root.tsx"
// unocss
import "@radix-ui/themes/styles.css"
import "@unocss/reset/tailwind-compat.css"
import "@unocss/reset/tailwind.css"
import "virtual:uno.css"
import "./index.css"
// jotai
import { DevTools } from "jotai-devtools"
import "jotai-devtools/styles.css"
import { createStore, Provider } from "jotai"

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={<Root />}
        errorElement={<ErrorPage />}
        loader={rootLoader}
        action={rootAction}
        id={rootRouteId}
      >
        <Route errorElement={<ErrorPage />}>
          <Route index element={<Index />} />
          <Route
            path="contacts/:contactId"
            element={<Contact />}
            loader={contactLoader}
            action={contactAction}
          />
          <Route
            path="contacts/:contactId/edit"
            element={<EditContact />}
            loader={contactLoader}
            action={editAction}
          />
          <Route
            path="contacts/:contactId/destroy"
            action={destroyAction}
            errorElement={<div>Oops! There was an error.</div>}
          />
        </Route>
      </Route>
      <Route path="fabricjs" element={<FabricDemo />} />
      <Route path="konva" element={<KonvaDemo />} />
    </>
  )
)

const store = createStore()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <DevTools theme="dark" position="bottom-right" />
      <Theme className={isWP ? "is-wordpress" : ""}>
        <div className="flex w-full h-[calc(100vh-var(--abh))]">
          <RouterProvider router={router} />
        </div>
      </Theme>
    </Provider>
  </StrictMode>
)
