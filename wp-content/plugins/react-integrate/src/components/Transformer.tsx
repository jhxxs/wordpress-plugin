import type Konva from "konva"
import { Transformer as KonvaTransformer } from "react-konva"
import AnchorDelete from "./AnchorDelete"
import { TransformerConfig } from "konva/lib/shapes/Transformer"

type TransformerProps = {
  isTransforming?: boolean
} & Konva.TransformerConfig

const Transformer = forwardRef<Konva.Transformer, TransformerProps>(
  (props, ref) => {
    const names = ["top-right", "bottom-right", "bottom-left"]
    const name = "top-left"

    const anchorDeleteRef = useRef<Konva.Image>(null)
    const { isTransforming, ...rest } = props as TransformerProps

    return (
      <KonvaTransformer
        ref={ref}
        flipEnabled={false}
        keepRatio
        anchorSize={12}
        anchorFill="#4affff"
        borderStroke="#4affff"
        borderStrokeWidth={1}
        borderDash={[3, 3]}
        anchorStroke="transparent"
        anchorCornerRadius={24}
        boundBoxFunc={(oldBox, newBox) => {
          if (newBox.width < 5 || newBox.height < 5) {
            return oldBox
          }
          return newBox
        }}
        enabledAnchors={isTransforming ? [...names, name] : names}
        {...rest}
      >
        <AnchorDelete ref={anchorDeleteRef} visible={isTransforming} />
      </KonvaTransformer>
    )
  }
)

export default Transformer
