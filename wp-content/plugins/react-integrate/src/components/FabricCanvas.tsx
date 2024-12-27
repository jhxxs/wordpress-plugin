import shirts_mockup from "@/assets/images/shirts_mockup.png"
import "@/utils/fabric"
import type { FabricObject } from "fabric"
import {
  Canvas,
  FabricImage,
  Group,
  Line,
  Rect,
  Textbox,
  type TPointerEvent,
  type TPointerEventInfo
} from "fabric"
import { useMount } from "react-use"

export interface FabricCanvasProps {
  className?: string
  /** 打印区域网格是否可见 */
  isPrintAreaGridVisible?: boolean
  /** 打印区域文字是否可见 */
  isPrintAreaTextVisible?: boolean
  /** 产品 Mockup 是否可见 */
  isMockupVisible?: boolean
  /** 是否启用拖拽 */
  isDragMode?: boolean
  /** 缩放比例 */
  ratio?: number
  onAdd?: (object: FabricObject, canvas: Canvas) => void
  onRemove?: (id?: string, canvas?: Canvas) => void
  onSelect?: (selected: FabricObject[], canvas: Canvas) => void
  onScale?: (object: FabricObject, canvas: Canvas) => void
}

export interface FabricCanvasRef {
  canvas?: Canvas | null
  /** 导出图片 */
  exportImage(): void
}

const presetObjectNames: NonNullable<FabricObject["name"]>[] = [
  "ProductMockup",
  "PrintAreaGrid",
  "PrintAreaText"
]
const printAreaNames: NonNullable<FabricObject["name"]>[] = [
  "PrintAreaGrid",
  "PrintAreaText"
]

export const FabricCanvas = forwardRef<FabricCanvasRef, FabricCanvasProps>(
  (
    {
      className = "",
      isPrintAreaGridVisible,
      isMockupVisible,
      isDragMode,
      ratio = 0,
      onAdd,
      onRemove,
      onSelect,
      onScale
    },
    ref
  ) => {
    const canvasElement = useRef<HTMLCanvasElement>(null)
    const canvasRef = useRef<Canvas | null>(null)

    const productMockup = useRef<FabricImage>()
    const printAreaGrid = useRef<Group>()
    const printAreaText = useRef<Textbox>()

    const stroke = "#04d1c6"
    const strokeWidth = 1.5
    const strokeDashArray = [strokeWidth, 3]

    async function initCanvas() {
      canvasRef.current = new Canvas(canvasElement.current!, {
        controlsAboveOverlay: true,
        preserveObjectStacking: true,
        backgroundColor: "transparent",
        uniformScaling: true,
        uniScaleKey: null
      })

      const canvas = canvasRef.current
      canvas.backgroundColor = "transparent"

      await createMockup()
      createPrintArea()
    }

    async function createMockup() {
      const canvas = canvasRef.current
      if (!canvas) return
      const image = await FabricImage.fromURL(
        shirts_mockup,
        { crossOrigin: "anonymous" },
        {
          width: 600,
          height: 600,
          left: (canvas.getWidth() - 600) / 2,
          top: (canvas.getHeight() - 600) / 2,
          selectable: false,
          backgroundColor: "#b6223d",
          evented: false,
          name: "ProductMockup"
        }
      )
      canvas.add(image)
      canvas.renderAll()

      productMockup.current = image
    }

    function createPrintArea() {
      const canvas = canvasRef.current
      if (!canvas) return

      const width = 222
      const height = 296
      const centerX = canvas.getWidth() / 2
      const centerY = (canvas.getHeight() - 130) / 2
      // 创建水平线
      const horizontalLine = new Line(
        [centerX - width / 2, centerY, centerX + width / 2, centerY],
        {
          fill: "transparent",
          stroke,
          strokeWidth,
          strokeDashArray,
          strokeUniform: true,
          selectable: false,
          evented: false
        }
      )

      // 创建垂直线
      const verticalLine = new Line(
        [centerX, centerY - height / 2, centerX, centerY + height / 2],
        {
          fill: "transparent",
          stroke,
          strokeWidth,
          strokeDashArray,
          strokeUniform: true,
          selectable: false,
          evented: false
        }
      )

      // 创建外框
      const rect = new Rect({
        left: centerX - width / 2,
        top: centerY - height / 2,
        width,
        height,
        fill: "transparent",
        stroke,
        strokeWidth,
        strokeDashArray,
        strokeUniform: true,
        selectable: false,
        evented: false
      })

      const group = new Group([horizontalLine, verticalLine, rect], {
        selectable: false,
        fill: "transparent",
        backgroundColor: "transparent",
        stroke,
        strokeWidth,
        strokeDashArray,
        strokeUniform: true,
        evented: false,
        visible: false,
        name: "PrintAreaGrid"
      })

      // 创建打印区域文字
      const textbox = new Textbox("Print area", {
        left: centerX - width / 2,
        top: group.top + group.height + 2,
        fontSize: 14,
        width: rect.width,
        fill: "#fff",
        fontFamily: "Arial",
        textAlign: "center",
        backgroundColor: "#17bcb5",
        strokeUniform: true,
        selectable: false,
        evented: false,
        visible: false,
        name: "PrintAreaText"
      })

      canvas.add(group, textbox)
      canvas.renderAll()
      printAreaGrid.current = group
      printAreaText.current = textbox
    }

    function toggleCanvasSelect(selectable: boolean) {
      const set = new Set([
        productMockup.current,
        printAreaGrid.current,
        printAreaText.current
      ]) as Set<FabricObject>

      canvasRef.current?.forEachObject((el) => {
        if (!set.has(el)) {
          el.set({ selectable })
        }
      })
      canvasRef.current?.renderAll()
    }

    function exportImage() {
      const canvas = canvasRef.current
      if (!canvas) return
      productMockup.current?.set({ visible: true })
      const vpt = canvas.viewportTransform
      canvas.viewportTransform = [1, 0, 0, 1, 0, 0]

      const url = canvas.toDataURL({
        left: 0,
        top: 0,
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        format: "png",
        multiplier: 1,
        quality: 1,
        filter: (item) =>
          !printAreaNames.includes(
            // @ts-expect-error name exists
            item.name
          )
      })

      canvas.viewportTransform = vpt
      productMockup.current?.set({ visible: false })

      const a = document.createElement("a")
      a.href = url!
      a.download = "canvas.png"
      a.click()
    }

    useImperativeHandle(ref, () => ({
      canvas: canvasRef.current,
      exportImage
    }))

    useMount(() => {
      console.log("mounted")

      if (canvasElement.current && !canvasRef.current) {
        initCanvas()
      }
    })

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const value = ratio
      const zoomFactor = value === 0 ? 1 : 1 + value / 100
      const oldZoom = canvas.getZoom()

      // 获取当前视口变换
      const vpt = canvas.viewportTransform
      if (!vpt) return

      // 如果是重置缩放（value === 0）
      if (value === 0) {
        canvas.setViewportTransform([
          zoomFactor,
          0,
          0,
          zoomFactor,
          (canvas.width * (1 - zoomFactor)) / 2,
          (canvas.height * (1 - zoomFactor)) / 2
        ])
      } else {
        // 计算缩放比例
        const scale = zoomFactor / oldZoom

        // 计算新的平移值
        const newPanX = vpt[4] * scale + (canvas.width! * (1 - scale)) / 2
        const newPanY = vpt[5] * scale + (canvas.height! * (1 - scale)) / 2

        // 应用边界限制
        const maxX = canvas.width! * (zoomFactor - 1)
        const maxY = canvas.height! * (zoomFactor - 1)

        vpt[0] = vpt[3] = zoomFactor
        vpt[4] = Math.min(Math.max(newPanX, -maxX), 0)
        vpt[5] = Math.min(Math.max(newPanY, -maxY), 0)

        canvas.setViewportTransform(vpt)
      }

      canvas.requestRenderAll()
      const zoom = canvas.getZoom()
      // console.log("zoom", zoom)

      printAreaGrid.current?.forEachObject((el) => {
        el.set({
          strokeWidth: 1 / zoom,
          strokeDashArray: strokeDashArray.map((v) => v / zoom)
        })
        canvas.renderAll()
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ratio])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      if (canvas.__customEvents) {
        canvas.off(canvas.__customEvents)
      }

      if (isDragMode) {
        canvas.selection = false
        canvas.discardActiveObject()
        toggleCanvasSelect(false)
        let isDragging = false
        let lastPosX: number
        let lastPosY: number

        const handlers = {
          "mouse:down": (opt: TPointerEventInfo<TPointerEvent>) => {
            const evt = opt.e as MouseEvent
            isDragging = true
            lastPosX = evt.clientX
            lastPosY = evt.clientY

            canvas.defaultCursor = "grab"
            canvas.renderAll()
          },
          "mouse:move": (opt: TPointerEventInfo<TPointerEvent>) => {
            const evt = opt.e as MouseEvent
            if (!isDragging) return

            const deltaX = evt.clientX - lastPosX
            const deltaY = evt.clientY - lastPosY

            const vpt = canvas.viewportTransform
            if (!vpt) return

            // 添加边界限制
            const maxX = canvas.width! * (canvas.getZoom() - 1)
            const maxY = canvas.height! * (canvas.getZoom() - 1)

            vpt[4] = Math.min(Math.max(vpt[4] + deltaX, -maxX), 0)
            vpt[5] = Math.min(Math.max(vpt[5] + deltaY, -maxY), 0)

            lastPosX = evt.clientX
            lastPosY = evt.clientY

            canvas.defaultCursor = "grabbing"
            canvas.renderAll()
          },
          "mouse:up": () => {
            isDragging = false

            canvas.defaultCursor = "grab"
            canvas.renderAll()
          }
        }

        canvas.__customEvents = handlers
        canvas.on(handlers)
      } else {
        toggleCanvasSelect(true)
        canvas.selection = true
        canvas.defaultCursor = "default"
        canvas.renderAll()

        const handlers = {
          "mouse:down": (opt: TPointerEventInfo<TPointerEvent>) => {
            if (!opt.target) return

            printAreaGrid.current?.set({
              visible: true
            })
            printAreaText.current?.set({
              visible: true
            })
            canvas.renderAll()
          },
          "mouse:up": (opt: TPointerEventInfo<TPointerEvent>) => {
            if (!opt.target) return
            if (!isPrintAreaGridVisible) {
              printAreaGrid.current?.set({
                visible: false
              })
            }

            printAreaText.current?.set({
              visible: false
            })
            canvas.renderAll()
          }
        }
        canvas.__customEvents = handlers
        canvas.on(handlers)
      }
    }, [isDragMode, isPrintAreaGridVisible])

    useEffect(() => {
      printAreaGrid.current?.set({
        visible: isPrintAreaGridVisible
      })
      canvasRef.current?.renderAll()
    }, [isPrintAreaGridVisible])

    useEffect(() => {
      productMockup.current?.set({
        visible: isMockupVisible
      })
      canvasRef.current?.renderAll()
    }, [isMockupVisible])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.on("object:added", (opt) => {
        console.log("object:added", opt.target.id)
        const name = opt.target.name
        if (presetObjectNames.includes(name!)) return
        onAdd?.(opt.target, canvas)
      })

      return () => canvas.off("object:added")
    }, [onAdd])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.on("object:removed", (opt) => {
        console.log("object:removed", opt.target.id)
        onRemove?.(opt.target.id, canvas)
      })
      return () => canvas.off("object:removed")
    }, [onRemove])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.on("selection:created", (opt) => {
        console.log("selection:created", opt)
        onSelect?.(opt.selected, canvas)
      })
      canvas.on("selection:updated", (opt) => {
        console.log("selection:updated", opt)
        onSelect?.(opt.selected, canvas)
      })
      canvas.on("selection:cleared", (opt) => {
        console.log("selection:cleared", opt)
        onSelect?.([], canvas)
      })

      return () => {
        canvas.off("selection:created")
        canvas.off("selection:updated")
        canvas.off("selection:cleared")
      }
    }, [onSelect])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.on("object:scaling", (opt) => {
        onScale?.(opt.target, canvas)
      })
      return () => canvas.off("object:scaling")
    }, [onScale])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.on("object:modified", (opt) => {
        console.log("object:modified", opt.target.id, opt.target)
      })
    }, [])

    return (
      <canvas
        ref={canvasElement}
        className={clsx("bg-transparent", className)}
        width="600px"
        height="600px"
      />
    )
  }
)
