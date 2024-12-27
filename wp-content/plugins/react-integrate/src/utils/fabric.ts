import iconDelete from "@/assets/images/delete.svg"
import { Control, InteractiveFabricObject, controlsUtils } from "fabric"

InteractiveFabricObject.customProperties = ["id", "name"]

InteractiveFabricObject.ownDefaults = {
  ...InteractiveFabricObject.ownDefaults,
  noScaleCache: false,
  cornerStyle: "circle",
  transparentCorners: false,
  lockScalingFlip: true,
  lockSkewingX: true,
  lockSkewingY: true,
  centeredRotation: true,
  borderColor: "#4affff",
  cornerColor: "#4affff",
  cornerStrokeColor: "4affff",
  hasBorders: true,
  borderDashArray: [2, 3],
  cornerSize: 10,
  centeredScaling: true,
  _controlsVisibility: {
    ml: false,
    mt: false,
    mr: false,
    mb: false
  }
}

const deleteImg = document.createElement('img')
deleteImg.src = iconDelete
InteractiveFabricObject.createControls = () => {
  const controls = controlsUtils.createTextboxDefaultControls()
  controls.tr.visible = false

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { actionHandler, ...rest } = controls.tr

  return {
    controls: {
      ...controls,
      deleteControl: new Control({
        ...rest,
        visible: true,
        cursorStyleHandler: () => "pointer",
        mouseUpHandler: (_eventData, transform) => {
          const target = transform.target
          const canvas = target.canvas
          if (!canvas) return true

          if (canvas.getActiveObjects().length > 1) {
            const activeObjects = canvas.getActiveObjects()
            activeObjects.forEach((item) => canvas.remove(item))
            canvas.discardActiveObject()
          } else {
            canvas.remove(target)
          }
          canvas.requestRenderAll()
          return true
        },
        async render(ctx, left, top, _styleOverride, fabricObject) {
          const size = 24
          if (!deleteImg.complete) {
            deleteImg.onload = () => {
              fabricObject.canvas?.requestRenderAll()
            }
            return
          }

          ctx.save()
          ctx.translate(left, top)
          ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size)
          ctx.restore()
        }
      })
    }
  }
}
