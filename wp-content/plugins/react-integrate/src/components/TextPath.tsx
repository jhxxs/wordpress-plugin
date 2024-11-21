import type Konva from "konva"
import type { TextPathConfig } from "konva/lib/shapes/TextPath"
import React from "react"
import { TextPath as KonvaTextPath } from "react-konva"

interface TextPathProps extends TextPathConfig {
  onSelect?: (e: Konva.KonvaEventObject<Event>) => void
  onChange?: (value: TextPathConfig) => void
}

export const TextPath: React.FC<TextPathProps> = ({
  onSelect,
  onChange,
  ...props
}) => {
  const shapeRef = useRef<Konva.TextPath>(null)

  return (
    <>
      <KonvaTextPath
        {...props}
        name="selectable"
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onDragEnd={(e) => {
          onChange?.({
            ...props,
            x: e.target.x(),
            y: e.target.y()
          })
        }}
        onTransformEnd={() => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current!
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // we will reset it back
          // node.scaleX(1)
          // node.scaleY(1)
          onChange?.({
            ...props,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY)
          })
        }}
      />
    </>
  )
}
