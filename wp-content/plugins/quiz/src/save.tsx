import { useBlockProps } from "@wordpress/block-editor"

export default function save() {
  return (
    <>
      <p {...useBlockProps.save()}>{"Quiz – hello from the saved content!"}</p>

      <div className="p-20px bg-cyan-400">unocss</div>
    </>
  )
}
