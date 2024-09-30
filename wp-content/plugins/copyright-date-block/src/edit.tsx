import { InspectorControls, useBlockProps } from "@wordpress/block-editor"
import type { BlockEditProps } from "@wordpress/blocks"
import { PanelBody, TextControl, ToggleControl } from "@wordpress/components"
import { __ } from "@wordpress/i18n"
import { type ComponentType, useEffect } from "react"
import { textdomain } from "./constants"

export interface EditProps {
  fallbackCurrentYear?: string
  showStartingYear?: boolean
  startingYear?: string
}

const Edit: ComponentType<BlockEditProps<EditProps>> = ({
  attributes,
  setAttributes
}) => {
  const currentYear = new Date().getFullYear().toString()
  const { fallbackCurrentYear, showStartingYear, startingYear } = attributes

  useEffect(() => {
    if (currentYear !== fallbackCurrentYear) {
      setAttributes({ fallbackCurrentYear: currentYear })
    }
  }, [currentYear, fallbackCurrentYear, setAttributes])

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Settings", textdomain)}>
          <ToggleControl
            label={__("Show starting year", textdomain)}
            checked={!!showStartingYear}
            onChange={(value) => setAttributes({ showStartingYear: value })}
          />
          {showStartingYear && (
            <TextControl
              label={__("Starting year", textdomain)}
              value={startingYear || ""}
              onChange={(value) => setAttributes({ startingYear: value })}
            />
          )}
        </PanelBody>
      </InspectorControls>
      {
        <p {...useBlockProps()}>
          ©️ {showStartingYear && (startingYear ? `${startingYear}-` : "")}
          {currentYear}
        </p>
      }
    </>
  )
}
export default Edit
