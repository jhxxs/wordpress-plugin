import { type Params, redirect } from "react-router"
import { deleteContact } from "../contacts"

export async function action({ params }: { params: Params<"contactId"> }) {
  await deleteContact(params.contactId)
  return redirect("/react-router")
}
