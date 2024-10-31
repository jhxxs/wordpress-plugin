import { AlertDialog, Button, Flex } from "@radix-ui/themes"
import { useRef, useState } from "react"
import {
  type ActionFunctionArgs,
  Form,
  json,
  Params,
  useFetcher,
  useLoaderData,
  useSubmit
} from "react-router-dom"
import { type ContactLoaderData, getContact, updateContact } from "../contacts"

// eslint-disable-next-line react-refresh/only-export-components
export async function loader({ params }: { params: Params<"contactId"> }) {
  const contact = await getContact(params.contactId)
  if (!contact) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found"
    })
  }
  return json({ contact })
}

// eslint-disable-next-line react-refresh/only-export-components
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true"
  })
}

interface Contact {
  id?: number
  first: string
  last: string
  avatar: string
  twitter: string
  notes: string
  favorite: boolean
}

export default function Contact() {
  const { contact } = useLoaderData() as ContactLoaderData
  const deleteForm = useRef<HTMLFormElement>(null)
  const submit = useSubmit()
  const [focused, setFocused] = useState(true)

  return (
    <div id="contact">
      <div>
        <img
          key={contact.avatar}
          src={
            contact.avatar ||
            `https://robohash.org/${contact.id}.png?size=200x200`
          }
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter && (
          <p>
            <a target="_blank" href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        )}

        {contact.notes && <p>{contact.notes}</p>}

        <div>
          <Form action="edit">
            <Button>Edit</Button>
          </Form>
          <Form method="post" action="destroy" ref={deleteForm}>
            <AlertDialog.Root onOpenChange={(e) => e && setFocused(true)}>
              <AlertDialog.Trigger>
                <Button type="button" color="red" variant="soft">
                  Delete
                </Button>
              </AlertDialog.Trigger>
              <AlertDialog.Content maxWidth="450px" align="center">
                <AlertDialog.Title>Delete Contact</AlertDialog.Title>
                <AlertDialog.Description size="2">
                  Please confirm you want to delete this record.
                </AlertDialog.Description>

                <Flex gap="3" mt="4" justify="end">
                  <AlertDialog.Cancel>
                    <Button variant="soft" color="gray" autoFocus={focused}>
                      Cancel
                    </Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action
                    onClick={() => submit(deleteForm.current)}
                  >
                    <Button variant="solid" color="red">
                      Confirm
                    </Button>
                  </AlertDialog.Action>
                </Flex>
              </AlertDialog.Content>
            </AlertDialog.Root>
          </Form>
        </div>
      </div>
    </div>
  )
}

function Favorite({ contact }: ContactLoaderData) {
  const fetcher = useFetcher()
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite

  console.log(
    "Favorite fetcher:",
    fetcher.formData,
    "favorite:",
    fetcher.formData?.get("favorite")
  )

  return (
    <fetcher.Form method="post">
      <button
        name="favorite"
        value={favorite ? "false" : "true"}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  )
}
