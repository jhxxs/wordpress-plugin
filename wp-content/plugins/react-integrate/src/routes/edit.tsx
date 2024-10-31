import {
  type ActionFunctionArgs,
  Form,
  redirect,
  useLoaderData,
  useNavigate
} from "react-router-dom"
import {
  type Contact,
  type ContactLoaderData,
  updateContact
} from "../contacts"
import { Button, TextArea, TextField } from "@radix-ui/themes"
import * as Label from "@radix-ui/react-label"

// eslint-disable-next-line react-refresh/only-export-components
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData) as unknown as Contact
  await updateContact(params.contactId, updates)
  return redirect(`/contacts/${params.contactId}`)
}

export default function EditContact() {
  const { contact } = useLoaderData() as ContactLoaderData
  const navigate = useNavigate()

  return (
    <Form method="post" id="contact-form">
      <Label.Root htmlFor="contact-name">
        <span>Name</span>
      </Label.Root>
      <div className="flex gap-x-12px">
        <TextField.Root
          placeholder="First"
          aria-label="First name"
          type="text"
          name="first"
          defaultValue={contact?.first}
        />
        <TextField.Root
          placeholder="Last"
          aria-label="Last name"
          type="text"
          name="last"
          defaultValue={contact?.last}
        />
      </div>
      <Label.Root htmlFor="contact-twitter">
        <span>Twitter</span>
      </Label.Root>
      <TextField.Root
        type="text"
        name="twitter"
        id="contact-twitter"
        placeholder="@jack"
        defaultValue={contact?.twitter}
      />

      <Label.Root htmlFor="contact-avatar">
        <span>Avatar URL</span>
      </Label.Root>
      <TextField.Root
        placeholder="https://example.com/avatar.jpg"
        aria-label="Avatar URL"
        type="text"
        name="avatar"
        id="contact-avatar"
        defaultValue={contact?.avatar}
      />

      <Label.Root htmlFor="contact-notes">
        <span>Notes</span>
      </Label.Root>
      <TextArea
        name="notes"
        id="contact-notes"
        className="w-full"
        defaultValue={contact?.notes}
        rows={6}
      />

      <div className="flex gap-8px">
        <Button>Save</Button>
        <Button
          type="button"
          variant="soft"
          color="gray"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>
    </Form>
  )
}
