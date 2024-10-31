import { type Params, redirect } from "react-router-dom"
import { deleteContact } from "../contacts"

export async function action({ params }: { params: Params<"contactId"> }) {
  await deleteContact(params.contactId)
  return redirect("/")
}
