import {
  Form,
  LoaderFunctionArgs,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
  useSubmit
} from "react-router-dom"
import { type Contact, createContact, getContacts } from "../contacts"
import { useEffect } from "react"
import { Button, Spinner, TextField } from "@radix-ui/themes"
import clsx from "clsx"
import { isWP } from "../constants"

// eslint-disable-next-line react-refresh/only-export-components
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")
  const contacts = await getContacts(q)
  return { contacts, q }
}

// eslint-disable-next-line react-refresh/only-export-components
export async function action() {
  const contact = await createContact()
  return redirect(`/contacts/${contact.id}/edit`)
}

export default function Root() {
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
