import { Button, Spinner, TextField } from "@radix-ui/themes"
import { useEffect } from "react"
import {
  Form,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
  useSubmit
} from "react-router"
import type { Route } from "../+types/root"
import { type Contact, createContact, getContacts } from "../contacts"
import IconHome from "~icons/material-symbols/home-outline-rounded"

// eslint-disable-next-line react-refresh/only-export-components
export async function clientLoader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")
  const contacts = await getContacts(q)
  return { contacts, q }
}

// eslint-disable-next-line react-refresh/only-export-components
export async function clientAction() {
  const contact = await createContact()
  return redirect(`/react-router/contacts/${contact.id}/edit`)
}

export default function ReactRouterDemo() {
  const { contacts, q } = useLoaderData() as {
    contacts: Contact[]
    q?: string | null
  }
  const navigation = useNavigation()
  const submit = useSubmit()

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q")

  useEffect(() => {
    const qEle = document.querySelector<HTMLInputElement>("#q")
    if (qEle) qEle.value = q || ""
  }, [q])

  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div className="flex">
          <NavLink to="/">
            <IconHome className="text-24px" />
          </NavLink>
          <Form id="search-form" role="search" className="flex-1">
            <TextField.Root
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
              size="3"
              defaultValue={q || ""}
              onChange={(e) => {
                const isFirstSearch = q == null
                submit(e.currentTarget.form, {
                  replace: !isFirstSearch
                })
              }}
            />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          <Form method="post">
            <Button size="3">New</Button>
          </Form>
        </div>
        <nav>
          {searching ? (
            <Spinner loading={true} size="3" />
          ) : contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div id="detail">
        <Spinner loading={navigation.state === "loading"} size="3">
          <Outlet />
        </Spinner>
      </div>
    </>
  )
}
