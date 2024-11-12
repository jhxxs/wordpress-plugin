import shirts_mockup from "@/assets/images/shirts_mockup.png"
import { canvasEmitter } from "@/bus/canvas"
import * as Slider from "@radix-ui/react-slider"
import {
  Button,
  DropdownMenu,
  SegmentedControl,
  Separator
} from "@radix-ui/themes"
import clsx from "clsx"
import * as fabric from "fabric"
import {
  Canvas,
  FabricImage,
  FabricText,
  Group,
  Line,
  Rect,
  Textbox,
  TextProps,
  type TEvent
} from "fabric"
import { useMount } from "react-use"
import IconFullscreen from "~icons/gridicons/fullscreen"
import IconMockup from "~icons/iconoir/plus-square-dashed"
import IconGrid from "~icons/iconoir/square-dashed"
import IconHand from "~icons/material-symbols/back-hand"
import IconHandOutline from "~icons/material-symbols/back-hand-outline"
import IconImage from "~icons/material-symbols/image-outline"
import IconPlacement from "~icons/mdi/view-dashboard-outline"
import FullscreenMockup from "./FullscreenMockup"
import Operations from "./Operations"
import Parts from "./Parts"
import ToggleButton from "./ToggleButton"
import Tooltip from "./Tooltip"

// 方法 1: 生成十六进制颜色
function getRandomHexColor(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  )
}

const ratios = [0, 10, 25, 50, 75, 100, 125, 200, 300]
const switchs = [
  {
    value: "show",
    title: "Show mockup",
    icon: IconImage
  },
  {
    value: "hide",
    title: "Hide mockup",
    icon: IconMockup
  }
] as const
type SwitchType = (typeof switchs)[number]["value"]

const Panel: React.FC<{
  children?: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  const canvasRef = useRef<fabric.Canvas>()
  const canvasElement = useRef<HTMLCanvasElement>(null)

  const stroke = "#4affff",
    strokeWidth = 1,
    strokeDashArray = [strokeWidth, 4]

  const [currentSwitch, setCurrentSwitch] = useState<SwitchType>(
    switchs[0].value
  )
  const isMockupShow = currentSwitch === "show"

  const ratioMin = ratios[0]
  const ratioMax = ratios[ratios.length - 1]
  const [ratio, setRatio] = useState(0)
  const isZooming = ratio > 0

  const [isDragMode, setIsDragMode] = useState(false)

  const [isFullScreenMockOpen, setIsFullScreenMockOpen] = useState(false)

  const productMockup = useRef<FabricImage>()
  const printArea = useRef<Group>()

  const textSelection = useRef<FabricText>()
  const imageSelection = useRef<FabricImage>()

  useMount(() => {
    if (canvasElement.current && !canvasRef.current) {
      canvasRef.current = new fabric.Canvas(canvasElement.current, {
        controlsAboveOverlay: true
      })
      initProduct()
    }

    canvasEmitter.on("addText", addText)

    return () => {
      canvasEmitter.off("addText")
      console.log("unmount")
    }
  })

  // useEffect(() => {
  //   canvasEmitter.on("addText", addText)

  //   return () => {
  //     canvasEmitter.off("addText")
  //     console.log("unmount")
  //   }
  // }, [editor])

  useEffect(() => {
    if (ratio === 0) {
      toggleDragMode(false)
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const zoom = canvas.getZoom()
    // console.log("zoom", zoom)

    printArea.current?.forEachObject((el) => {
      el.set({
        strokeWidth: 1 / zoom,
        strokeDashArray: strokeDashArray.map((v) => v / zoom)
      })
      canvas.renderAll()
    })
  }, [ratio])

  const rightBtns = [
    {
      title: "Placement",
      icon: IconPlacement,
      onClick: () => {
        console.log(canvasRef.current?.toJSON())
      },
      disableToogle: true
    },
    {
      title: "Fullscreen preview",
      icon: IconFullscreen,
      disableToogle: true,
      onClick: () => setIsFullScreenMockOpen(true)
    },
    {
      title: "Grid",
      icon: IconGrid,
      disableToogle: false,
      onClick: (checked: boolean) => {
        console.log("grid", checked)
        if (printArea.current) {
          printArea.current.visible = checked
          canvasRef.current?.renderAll()
        }
      }
    }
  ]

  async function initProduct() {
    // onReady(canvas)
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.backgroundColor = "transparent"
    await initProductMockup(canvas)
    createGridLines(canvas)
    canvas.renderAll()
  }

  function createGridLines(canvas: Canvas) {
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
        selectable: false
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
        selectable: false
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
      selectable: false
    })

    const text = new Textbox("Print area", {
      left: centerX - width / 2,
      top: rect.top + rect.height + 2,
      fontSize: 14,
      width: rect.width,
      fill: "#fff",
      fontFamily: "Arial",
      textAlign: "center",
      backgroundColor: "#17bcb5",
      strokeUniform: true,
      selectable: false
    })

    const group = new Group([horizontalLine, verticalLine, rect, text], {
      selectable: false,
      fill: "transparent",
      backgroundColor: "transparent",
      stroke,
      strokeWidth,
      strokeDashArray,
      strokeUniform: true
    })

    group.visible = true
    canvas.add(group)
    canvas.renderAll()
    printArea.current = group
  }

  async function initProductMockup(canvas: Canvas) {
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
        evented: false
      }
    )
    canvas.backgroundColor = "transparent"
    canvas.add(image)
    canvas.renderAll()
    productMockup.current = image
  }

  function addText(str?: string, options?: Partial<TextProps>) {
    const canvas = canvasRef.current
    console.log("addText", str, canvas)
    if (!canvas) return

    const defaultOptions: Partial<TextProps> = {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#000000",
      originX: "center",
      originY: "center",
      lockScalingFlip: true,
      // lockScalingX: true,
      // lockScalingY: true,
      lockSkewingX: true,
      lockSkewingY: true,
      centeredRotation: true,
      borderColor: "#4affff",
      cornerColor: "#4affff",
      borderDashArray: [1, 3],
      cornerSize: 6,
      transparentCorners: false,
      ...options
    }

    if (!textSelection.current) {
      const text = new FabricText(str || "", {
        ...defaultOptions,
        data: {
          type: "text",
          id: Date.now()
        }
      })
      text.setControlsVisibility({
        ml: false,
        mt: false,
        mr: false,
        mb: false
      })
      text.cornerStyle = "circle"
      canvas.add(text)
      canvas.setActiveObject(text)
      textSelection.current = text
    } else {
      textSelection.current.set({ text: str })
    }

    console.log(textSelection)

    canvas.renderAll()
  }

  function handleZoom(value: number) {
    const canvas = canvasRef.current
    if (!canvas) return

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

    canvas.backgroundColor = "transparent"
    canvas.requestRenderAll()
  }

  function onSwitchChange(value: SwitchType) {
    setCurrentSwitch(value)
    const canvas = canvasRef.current
    if (!canvas || !productMockup.current) return
    productMockup.current.visible = value === "show"
    canvas.renderAll()
  }

  function toggleDragMode(enableDragging: boolean) {
    setIsDragMode(enableDragging)

    const canvas = canvasRef.current
    if (!canvas) return
    if (enableDragging) {
      canvas.selection = false
      let isDragging = false
      let lastPosX: number
      let lastPosY: number

      const handlers = {
        "mouse:down": (opt: TEvent) => {
          const evt = opt.e as MouseEvent
          isDragging = true
          canvas.defaultCursor = "grab"
          lastPosX = evt.clientX
          lastPosY = evt.clientY
        },
        "mouse:move": (opt: TEvent) => {
          const evt = opt.e as MouseEvent
          if (!isDragging) return
          canvas.defaultCursor = "grabbing"

          const deltaX = evt.clientX - lastPosX
          const deltaY = evt.clientY - lastPosY

          const vpt = canvas.viewportTransform
          if (!vpt) return

          // 添加边界限制
          const maxX = canvas.width! * (canvas.getZoom() - 1)
          const maxY = canvas.height! * (canvas.getZoom() - 1)

          vpt[4] = Math.min(Math.max(vpt[4] + deltaX, -maxX), 0)
          vpt[5] = Math.min(Math.max(vpt[5] + deltaY, -maxY), 0)

          canvas.requestRenderAll()

          lastPosX = evt.clientX
          lastPosY = evt.clientY
        },
        "mouse:up": () => {
          isDragging = false
          canvas.defaultCursor = "grab"
        }
      }

      canvas.on(handlers)
      canvas._dragHandlers = handlers
    } else {
      canvas.selection = true
      canvas.setCursor("default")
      const handlers = canvas._dragHandlers

      if (handlers) {
        canvas.off("mouse:down", handlers["mouse:down"])
        canvas.off("mouse:move", handlers["mouse:move"])
        canvas.off("mouse:up", handlers["mouse:up"])

        delete canvas?._dragHandlers
      }
      canvas.defaultCursor = "default"
    }

    canvas.backgroundColor = "transparent"
    canvas.requestRenderAll()
  }

  return (
    <>
      <FullscreenMockup
        open={isFullScreenMockOpen}
        onOpenChange={setIsFullScreenMockOpen}
      />
      <div className={clsx("p-24px overflow-y-auto pb-100px", className)}>
        <Parts className="mb-24px" />
        <Operations className="mb-24px" />

        <div className="bg-white rounded-10px">
          <div
            className={`h-600px relative ${isMockupShow ? "bg-transparent" : "squared-bg"}`}
          >
            <div className="absolute right-12px top-12px p-3px rounded-5px bg-white flex flex-col gap-y-4px z-1 border-1 border-#e5e5e5">
              {rightBtns.map((v) => (
                <Tooltip
                  key={v.title}
                  content={v.title}
                  side="right"
                  style={
                    {
                      "--space-4": "8px",
                      "--cursor-button": "pointer"
                    } as React.CSSProperties
                  }
                >
                  <ToggleButton
                    disableToggle={v.disableToogle}
                    onClick={v.onClick}
                  >
                    <v.icon />
                  </ToggleButton>
                </Tooltip>
              ))}
            </div>
            <div className="w-full h-full min-w-600px flex items-center justify-center">
              <canvas
                ref={canvasElement}
                className={`size-600px mx-auto bg-transparent`}
                width="600px"
                height="600px"
              />
            </div>
          </div>
          <div className="flex justify-center items-center px-16px h-56px border-t border-#e5e5e5 ">
            <Slider.Root
              className="relative flex-shrink-0 flex h-5 w-[240px] touch-none select-none items-center mr-16px"
              defaultValue={[ratio]}
              step={1}
              min={ratioMin}
              max={ratioMax}
              value={[ratio]}
              onValueChange={(e) => {
                const value = e[0]
                setRatio(value)
                handleZoom(value)
              }}
            >
              <Slider.Track className="relative h-4px grow rounded-full bg-#e5e5e5">
                <Slider.Range className="absolute h-full rounded-full " />
              </Slider.Track>
              <Slider.Thumb
                className="block size-24px rounded-24px bg-white border-1px border-#ccc shadow-[0_2px_4px_0] shadow-black shadow-opacity-7 focus:outline-none cursor-pointer"
                aria-label="ratio"
              />
            </Slider.Root>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button
                  size="3"
                  color="gray"
                  variant="outline"
                  className="w-90px !px-0px "
                >
                  <span className="text-14px text-#222">{ratio}%</span>
                  <DropdownMenu.TriggerIcon />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-90px">
                {[...ratios].reverse().map((item) => (
                  <DropdownMenu.Item
                    key={item}
                    onClick={() => {
                      setRatio(item)
                      handleZoom(item)
                    }}
                    className={item === ratio ? "bg-#3164d9 text-white" : ""}
                  >
                    <span className="text-14px">{item}%</span>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <Tooltip
              content={
                <span className="flex items-center gap-x-8px">
                  <span>Navigate</span>
                  <span className="size-20px bg-#777 transform -rotate-90 flex items-center justify-center text-xs">
                    [
                  </span>
                </span>
              }
              sideOffset={15}
              delayDuration={10}
            >
              <button
                className={`size-40px flex items-center justify-center rounded-5px text-20px ml-8px ${
                  isDragMode
                    ? "bg-#dbf2fa text-#1164a9"
                    : isZooming
                      ? "text-#222 hover:bg-#e5e5e5"
                      : "cursor-not-allowed text-#b1b1b1"
                }`}
                disabled={!isZooming}
                onClick={() => toggleDragMode(!isDragMode)}
              >
                {isDragMode ? <IconHand /> : <IconHandOutline />}
              </button>
            </Tooltip>

            <Separator
              orientation="vertical"
              className="!h-[calc(100%-15px)] mx-16px"
            />
            <SegmentedControl.Root
              defaultValue={currentSwitch}
              size="3"
              value={currentSwitch}
              onValueChange={onSwitchChange}
              style={
                {
                  "--space-4": "8px",
                  "--cursor-button": "pointer"
                } as React.CSSProperties
              }
            >
              {switchs.map(({ value, title, ...item }) => (
                <SegmentedControl.Item
                  value={value}
                  key={value}
                  className="cursor-pointer"
                >
                  <Tooltip
                    key={value}
                    content={title}
                    sideOffset={15}
                    delayDuration={10}
                  >
                    <div className="size-24px">
                      <item.icon className="text-20px" />
                    </div>
                  </Tooltip>
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </div>
        </div>
      </div>
    </>
  )
}

export default Panel
