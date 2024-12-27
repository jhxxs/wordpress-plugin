import { StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"
// jotai
import { createStore, Provider } from "jotai"
import { HydratedRouter } from "react-router/dom"
import "jotai-devtools/styles.css"
import "unocss"

const store = createStore()

hydrateRoot(
  document,
  <StrictMode>
    <Provider store={store}>
      <HydratedRouter />
    </Provider>
  </StrictMode>
)
