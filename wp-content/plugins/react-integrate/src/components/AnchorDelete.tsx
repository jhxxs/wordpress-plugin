import icon_delete from "@/assets/images/delete.svg"
import type Konva from "konva"
import type { KonvaNodeComponent } from "react-konva"
import { Image as KonvaImage } from "react-konva"
import type { Except } from "type-fest"
import useImage from "use-image"

type AnchorDeleteProps = Except<Konva.ImageConfig, "image">

const AnchorDelete = forwardRef<Konva.Image, AnchorDeleteProps>(
  (props, ref) => {
    const [iconDelete] = useImage(icon_delete, "anonymous")
    return (
      <KonvaImage
        listening={false}
        ref={ref}
        image={iconDelete}
        width={24}
        height={24}
        offset={{ x: 12, y: 12 }}
        {...props}
      />
    )
  }
) as unknown as KonvaNodeComponent<Konva.Image, AnchorDeleteProps>

export default AnchorDelete
