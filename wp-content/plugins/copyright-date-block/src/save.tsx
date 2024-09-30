import { type EditProps } from "./edit"
import type { ComponentType } from "react"
import type { BlockSaveProps } from "@wordpress/blocks"
import { useBlockProps } from "@wordpress/block-editor"

const Save: ComponentType<BlockSaveProps<EditProps>> = ({ attributes }) => {
  const { fallbackCurrentYear, showStartingYear, startingYear } = attributes

  if (!fallbackCurrentYear) return
  return (
    <p {...useBlockProps.save()}>
      😀©️ {showStartingYear && (startingYear ? `${showStartingYear}-` : "")}
      {fallbackCurrentYear}
    </p>
  )
}
export default Save
