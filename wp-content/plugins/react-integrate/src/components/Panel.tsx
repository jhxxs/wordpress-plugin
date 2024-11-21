import iconDelete from "@/assets/images/delete.svg"
import shirts_mockup from "@/assets/images/shirts_mockup.png"
import { canvasEmitter } from "@/bus/canvas"
import {
  activeShapeAtom,
  shapeListAtom,
  selectedShapeListAtom
} from "@/store/canvas"
import * as Slider from "@radix-ui/react-slider"
import {
  Button,
  DropdownMenu,
  SegmentedControl,
  Separator
} from "@radix-ui/themes"
import clsx from "clsx"
import {
  Canvas,
  Control,
  FabricImage,
  FabricObject,
  FabricText,
  Group,
  InteractiveFabricObject,
  Line,
  Rect,
  TextProps,
  Textbox,
  controlsUtils,
  util,
  type TPointerEvent,
  type TPointerEventInfo
} from "fabric"
import { getDefaultStore } from "jotai"
import { useAtom } from "jotai/react"
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
import { isTextPath } from "@/utils"
import { useMount } from "react-use"

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

InteractiveFabricObject.customProperties = ["id", "name"]
InteractiveFabricObject.ownDefaults = {
  ...InteractiveFabricObject.ownDefaults,
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
  _controlsVisibility: {
    ml: false,
    mt: false,
    mr: false,
    mb: false
  }
}

const deleteImg = new Image()
deleteImg.src = iconDelete
InteractiveFabricObject.createControls = () => {
  const controls = controlsUtils.createTextboxDefaultControls()
  controls.tr.visible = false

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { actionHandler, ...rest } = controls.tr

  return {
    controls: {
      ...controls,
      delete: new Control({
        ...rest,
        visible: true,
        cursorStyleHandler: () => "pointer",
        mouseUpHandler: (_eventData, transform) => {
          const store = getDefaultStore()
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

          store.set(selectedShapeListAtom, () => [])
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
          ctx.rotate(util.degreesToRadians(fabricObject.angle!))
          ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size)
          ctx.restore()
        }
      })
    }
  }
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

const Panel: React.FC<{
  children?: React.ReactNode
  className?: string
}> = ({ className }) => {
  const canvasRef = useRef<Canvas>()
  const canvasElement = useRef<HTMLCanvasElement>(null)

  const stroke = "#04d1c6"
  const strokeWidth = 1.5
  const strokeDashArray = [strokeWidth, 3]

  const [currentSwitch, setCurrentSwitch] = useState<SwitchType>(
    switchs[0].value
  )
  const isMockupShow = currentSwitch === "show"

  const ratioMin = ratios[0]
  const ratioMax = ratios[ratios.length - 1]
  const [ratio, setRatio] = useState(0)
  const isZooming = ratio > 0

  const [isDragMode, setIsDragMode] = useState(false)
  const isPrintAreaGridVisible = useRef(false)

  const [isFullScreenMockOpen, setIsFullScreenMockOpen] = useState(false)

  const productMockup = useRef<FabricImage>()
  const printAreaGrid = useRef<Group>()
  const printAreaText = useRef<Textbox>()

  const [selections, setSelections] = useAtom(selectedShapeListAtom)
  const [objects, setObjects] = useAtom(shapeListAtom)
  const [activeObject, setActiveObject] = useAtom(activeShapeAtom)

  useMount(() => {
    console.log("mounted")

    if (canvasElement.current && !canvasRef.current) {
      initCanvas()
    }

    return () => {
      canvasEmitter.off("addText")
      console.log("unmount")
    }
  })

  useEffect(() => {
    if (ratio === 0) {
      toggleDragMode(false)
    }

    const canvas = canvasRef.current
    if (!canvas) return
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

  const rightBtns = [
    {
      title: "Placement",
      icon: IconPlacement,
      onClick: () => {
        const canvas = canvasRef.current
        if (!canvas) return
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

        const a = document.createElement("a")
        a.href = url!
        a.download = "canvas.png"
        a.click()
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
        console.log("onClick", checked)

        isPrintAreaGridVisible.current = checked
        printAreaGrid.current?.set({
          visible: checked
        })
        canvasRef.current?.renderAll()
      }
    }
  ]

  function filterPresetObjects(objects: FabricObject[]) {
    return objects.filter((v) => !presetObjectNames.includes(v.name!))
  }

  async function initCanvas() {
    canvasRef.current = new Canvas(canvasElement.current!, {
      controlsAboveOverlay: true
    })

    const canvas = canvasRef.current
    canvas.backgroundColor = "transparent"
    canvas.on("selection:created", (opt) => {
      console.log("selection:created", opt)
      setSelections(opt.selected)
    })
    canvas.on("selection:updated", (opt) => {
      console.log("selection:updated", opt)
      setSelections(opt.selected)
    })
    canvas.on("selection:cleared", (opt) => {
      console.log("selection:cleared", opt)
      setSelections([])
    })

    canvas.on("object:added", (opt) => {
      console.log("object:added", opt.target)

      setObjects((state) => filterPresetObjects([...state, opt.target]))
    })
    canvas.on("object:removed", (opt) => {
      console.log("object:removed", opt.target)

      setActiveObject((state) => (opt.target === state ? null : state))
      setObjects((state) =>
        filterPresetObjects(state.filter((v) => v !== opt.target))
      )
    })

    canvas.on("object:moving", (opt) => {
      console.log("object:moving", opt.target)

      setObjects((state) =>
        filterPresetObjects(
          state.map((v) => (v === opt.target ? opt.target : v))
        )
      )
    })
    canvas.on("object:scaling", (opt) => {
      console.log("object:scaling", opt.target)

      setObjects((state) =>
        filterPresetObjects(
          state.map((v) => (v === opt.target ? opt.target : v))
        )
      )
    })
    canvas.on("object:rotating", (opt) => {
      console.log("object:rotating", opt.target)

      setObjects((state) =>
        filterPresetObjects(
          state.map((v) => (v === opt.target ? opt.target : v))
        )
      )
    })
    canvas.on("object:modified", (opt) => {
      console.log("object:modified", opt.target)

      setObjects((state) =>
        filterPresetObjects(
          state.map((v) => (v === opt.target ? opt.target : v))
        )
      )
    })

    await createMockup()
    createPrintArea()
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
        id: "123",
        name: "ProductMockup"
      }
    )
    canvas.add(image)
    canvas.renderAll()

    productMockup.current = image
  }

  const addText = useCallback(
    (str?: string, options?: Partial<TextProps>) => {
      const canvas = canvasRef.current
      // console.log("addText", str, canvas)
      if (!canvas) return

      const defaultOptions: Partial<TextProps> = {
        left: canvas.width / 2,
        top: canvas.height / 2,
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#000000",
        ...options
      }

      console.log("before activeObject", activeObject)

      if (activeObject) {
        if (isTextPath(activeObject)) {
          activeObject.set({ text: str })
        }
      } else {
        const text = new FabricText(str || "", {
          ...defaultOptions
        })
        setActiveObject(text)
        console.log("after activeObject", activeObject, text)
        canvas.add(text)
        canvas.setActiveObject(text)
      }
      canvas.renderAll()
    },
    [activeObject, setActiveObject]
  )

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

    canvas.requestRenderAll()
  }

  function onSwitchChange(value: SwitchType) {
    setCurrentSwitch(value)
    productMockup.current?.set({
      visible: value === "show"
    })
    canvasRef.current?.renderAll()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (canvas.__customEvents) {
      canvas.off(canvas.__customEvents)
    }

    if (isDragMode) {
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
          if (!isPrintAreaGridVisible.current) {
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
  }, [isDragMode])

  function toggleDragMode(enable: boolean) {
    setIsDragMode(enable)

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.selection = false
  }

  function toggleCanvasSelect(selectable: boolean) {
    const set = new Set([
      productMockup.current,
      printAreaGrid.current,
      printAreaText.current
    ]) as Set<FabricObject>

    canvasRef.current?.forEachObject((el) => {
      if (!set.has(el)) {
        console.log("toggleCanvasSelect", el.type)
        el.set({
          selectable
        })
      }
    })
    canvasRef.current?.renderAll()
  }

  useEffect(() => {
    canvasEmitter.on("addText", addText)
    return () => {
      canvasEmitter.off("addText", addText)
    }
  }, [addText])

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
