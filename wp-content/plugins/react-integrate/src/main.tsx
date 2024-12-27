import { Spinner, Theme } from "@radix-ui/themes"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  createHashRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  type LoaderFunction
} from "react-router"
import { isWP, rootRouteId } from "./constants"
import ErrorPage from "./error-page"
import Contact, {
  action as contactAction,
  loader as contactLoader
} from "./routes/contacts"
import { action as destroyAction } from "./routes/destroy"
import EditContact, { action as editAction } from "./routes/edit"
import { FabricDemo } from "./routes/fabric-demo"
import Index from "./routes/index"
import { FabricDemo as KonvaDemo } from "./routes/konva"
import ReactRouterDemo, {
  clientAction as ReactRouterDemoAction,
  clientLoader as ReactRouterDemoLoader
} from "./routes/react-router-demo"
import Root from "./routes/root"
// unocss
import "@unocss/reset/tailwind-compat.css"
import "@unocss/reset/tailwind.css"
// radix
import "@radix-ui/themes/styles.css"
import "virtual:uno.css"
import "./index.css"
// jotai
import { createStore, Provider } from "jotai"
import { DevTools } from "jotai-devtools"
import "jotai-devtools/styles.css"

const store = createStore()
const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Root />} />
      <Route
        path="react-router"
        element={<ReactRouterDemo />}
        errorElement={<ErrorPage />}
        loader={ReactRouterDemoLoader as LoaderFunction}
        action={ReactRouterDemoAction}
        id={rootRouteId}
        hydrateFallbackElement={
          <div className="flex justify-center items-center h-full w-full">
            <Spinner loading={true} size="3" />
          </div>
        }
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
