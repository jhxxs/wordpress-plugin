import shirts_mockup from "@/assets/images/shirts_mockup.png"
import { canvasEmitter } from "@/bus/konva"
import type { ShapeConfig } from "@/store/konva"
import { selectedIdsAtom, shapeListAtom } from "@/store/konva"
import * as Slider from "@radix-ui/react-slider"
import {
  Button,
  DropdownMenu,
  SegmentedControl,
  Separator
} from "@radix-ui/themes"
import { useAtom } from "jotai/react"
import Konva from "konva"
import { Image as KonvaImage, Layer, Rect, Stage } from "react-konva"
import { useMount } from "react-use"
import useImage from "use-image"
import FullscreenMockup from "./FullscreenMockup"
import Operations from "./Operations"
import PrintArea, { type PrintAreaRef } from "./PrintArea"
import ToggleButton from "./ToggleButton"
import Tooltip from "./Tooltip"
// icons
import { isTextPath } from "@/utils"
import IconFullscreen from "~icons/gridicons/fullscreen"
import IconMockup from "~icons/iconoir/plus-square-dashed"
import IconGrid from "~icons/iconoir/square-dashed"
import IconHand from "~icons/material-symbols/back-hand"
import IconHandOutline from "~icons/material-symbols/back-hand-outline"
import IconImage from "~icons/material-symbols/image-outline"
import IconColor from "~icons/mdi/color"
import IconPlacement from "~icons/mdi/view-dashboard-outline"
import { TextPath } from "./TextPath"
import Transformer from "./Transformer"

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
}> = ({ className }) => {
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
  const [isFullScreenMockOpen, setIsFullScreenMockOpen] = useState(false)

  useMount(() => {
    console.log("mounted")
    return () => {
      canvasEmitter.off("addText")
      console.log("unmount")
    }
  })

  useEffect(() => {
    if (ratio === 0) {
      toggleDragMode(false)
    }
  }, [ratio])

  const rightBtns = [
    {
      title: "Placement",
      icon: IconPlacement,
      disableToogle: true,
      onClick: () => {
        const stage = stageRef.current
        if (!stage) return

        // 保存当前的缩放和位置状态
        const currentScale = stage.scale()
        const currentPos = stage.position()

        // 临时重置缩放和位置
        stage.scale({ x: 1, y: 1 })
        stage.position({ x: 0, y: 0 })

        // 创建一个临时的 Layer 来渲染不包含 PrintArea 的内容
        const tempLayer = new Konva.Layer()
        stage.add(tempLayer)

        // 克隆所有需要导出的对象到临时图层
        stage.children.forEach((layer) => {
          layer.children.forEach((child) => {
            if (!["PrintAreaGrid", "PrintAreaText"].includes(child.name())) {
              const clone = child.clone()
              tempLayer.add(clone)
            }
          })
        })

        // 导出图片
        const dataURL = stage.toDataURL({
          pixelRatio: 1, // 使用原始像素比
          width: stage.width(),
          height: stage.height(),
          quality: 1,
          mimeType: "image/png"
        })

        // 移除临时图层
        tempLayer.destroy()

        // 恢复原始的缩放和位置
        stage.scale(currentScale)
        stage.position(currentPos)
        stage.batchDraw()

        // 下载图片
        const link = document.createElement("a")
        link.download = "canvas.png"
        link.href = dataURL
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
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
        isGridVisible.current = checked
        printAreaRef.current?.toggleGrid(checked)
      }
    }
  ]

  function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = e.target.getStage()
    if (!stage) return
    if (isDragMode) {
      // 开始拖拽
      setIsDragging(true)
      lastPos.current = stage.getPointerPosition() || { x: 0, y: 0 }
      stage.container().style.cursor = "grabbing"
    } else {
      const isElement = e.target.findAncestor(".elements-container")
      const isTransformer = e.target.findAncestor("Transformer")
      if (isElement || isTransformer) return

      const pos = stage.getPointerPosition()
      if (!pos) return

      // 转换为相对坐标
      const transform = stage.getAbsoluteTransform().copy()
      transform.invert()
      const relativePos = transform.point(pos)

      selection.current.visible = true
      selection.current.x1 = relativePos.x
      selection.current.y1 = relativePos.y
      selection.current.x2 = relativePos.x
      selection.current.y2 = relativePos.y
      updateSelectionRect()

      // 点击对象时显示 layerRef
      if (e.target !== e.target.getStage()) {
        printAreaRef.current?.showAll()
      }
    }
  }

  function handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = e.target.getStage()
    if (!stage) return
    if (isDragMode && isDragging) {
      const pos = stage.getPointerPosition()
      if (!pos) return

      // 计算位移
      const dx = pos.x - lastPos.current.x
      const dy = pos.y - lastPos.current.y

      // 获取当前位置和缩放
      const oldPos = stage.position()
      const scale = stage.scaleX()

      // 计算边界
      const maxX = stage.width() * (scale - 1)
      const maxY = stage.height() * (scale - 1)

      // 应用新位置（带边界限制）
      stage.position({
        x: Math.min(Math.max(oldPos.x + dx, -maxX), 0),
        y: Math.min(Math.max(oldPos.y + dy, -maxY), 0)
      })

      lastPos.current = pos
      stage.batchDraw()
    } else {
      if (!selection.current.visible) return
      const pos = stage.getPointerPosition()
      if (!pos) return

      // 转换为相对坐标
      const transform = stage.getAbsoluteTransform().copy()
      transform.invert()
      const relativePos = transform.point(pos)

      selection.current.x2 = relativePos.x
      selection.current.y2 = relativePos.y
      updateSelectionRect()
    }
  }

  function handleMouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = e.target.getStage()
    if (!stage) return
    if (isDragMode) {
      setIsDragging(false)
      stage.container().style.cursor = "grab"
    } else {
      setTimeout(() => {
        if (isGridVisible.current) {
          printAreaRef.current?.hideBottomText()
        } else {
          printAreaRef.current?.hideAll()
        }
      }, 0)

      oldPos.current = null
      selection.current.visible = false
      const { x1, x2, y1, y2 } = selection.current
      const moved = x1 !== x2 || y1 !== y2
      if (!moved) {
        updateSelectionRect()
        return
      }
      const selBox = selectionRectRef.current?.getClientRect()

      const elements: Konva.Node[] = []
      layerRef.current?.find(".selectable").forEach((elementNode) => {
        const elBox = elementNode.getClientRect()
        if (Konva.Util.haveIntersection(selBox!, elBox)) {
          elements.push(elementNode)
        }
      })

      selectShapes(elements.map((el) => el.id()))
      updateSelectionRect()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleMouseLeave(_e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = stageRef.current
    if (!stage) return
    if (isDragging) {
      setIsDragging(false)
      stage.container().style.cursor = "grab"
    }
  }

  function handleZoom(value: number) {
    const stage = stageRef.current
    if (!stage) return

    const zoomFactor = value === 0 ? 1 : 1 + value / 100
    const oldScale = stage.scaleX()

    // 获取舞台中心点
    const stageWidth = stage.width()
    const stageHeight = stage.height()
    const centerX = stageWidth / 2
    const centerY = stageHeight / 2

    // 如果是重置缩放（value === 0）
    if (value === 0) {
      stage.scale({ x: 1, y: 1 })
      stage.position({ x: 0, y: 0 })
    } else {
      // 计算新的缩放比例
      const scale = zoomFactor / oldScale

      // 获取当前位置
      const oldPos = stage.position()

      // 计算新的位置，保持中心点不变
      const newPos = {
        x: (oldPos.x - centerX) * scale + centerX,
        y: (oldPos.y - centerY) * scale + centerY
      }

      // 应用边界限制
      const maxX = stageWidth * (zoomFactor - 1)
      const maxY = stageHeight * (zoomFactor - 1)

      stage.scale({ x: zoomFactor, y: zoomFactor })
      stage.position({
        x: Math.min(Math.max(newPos.x, -maxX), 0),
        y: Math.min(Math.max(newPos.y, -maxY), 0)
      })
    }

    stage.batchDraw()
  }

  const [isDragging, setIsDragging] = useState(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isDragMode) {
      selectShapes([])
      layerRef.current?.draw()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragMode])

  function toggleDragMode(enable: boolean) {
    setIsDragMode(enable)
    const stage = stageRef.current
    if (!stage) return
    stage.container().style.cursor = enable ? "grab" : "default"
  }

  const isGridVisible = useRef(false)
  const stageWidth = 600,
    stageHeight = 600,
    printAreaWidth = 222,
    printAreaHeight = 296

  const [image] = useImage(shirts_mockup, "anonymous")
  const [mockupBg, setMockupBg] = useState("#b6223d")
  const colorPickerRef = useRef<HTMLInputElement>(null)

  const stageRef = useRef<Konva.Stage>(null)
  const printAreaRef = useRef<PrintAreaRef>(null)

  const [shapeList, setShapeList] = useAtom(shapeListAtom)
  const [selectedIds, selectShapes] = useAtom(selectedIdsAtom)
  const trRef = useRef<Konva.Transformer>(null)
  const layerRef = useRef<Konva.Layer>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const nodes = selectedIds.map((id) => layerRef.current?.findOne(`#${id}`)!)
    trRef.current?.nodes(nodes)
  }, [selectedIds])

  const selectionRectRef = useRef<Konva.Rect>(null)
  const selection = useRef({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  })

  const updateSelectionRect = () => {
    const node = selectionRectRef.current!
    node.setAttrs({
      visible: selection.current.visible,
      x: Math.min(selection.current.x1, selection.current.x2),
      y: Math.min(selection.current.y1, selection.current.y2),
      width: Math.abs(selection.current.x1 - selection.current.x2),
      height: Math.abs(selection.current.y1 - selection.current.y2),
      fill: "rgba(0, 161, 255, 0.3)"
    })
    node.getLayer()?.batchDraw()
  }

  const oldPos = useRef(null)

  const onClickTap = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isDragMode) return
    // if we are selecting with rect, do nothing
    const { x1, x2, y1, y2 } = selection.current
    const moved = x1 !== x2 || y1 !== y2
    if (moved) return
    const stage = e.target.getStage()
    const layer = layerRef.current!
    const tr = trRef.current!
    // if click on empty area - remove all selections
    if (e.target === stage) {
      selectShapes([])
      return
    }

    // do nothing if clicked NOT on our textpath or image
    if (!e.target.hasName("selectable")) return

    // do we pressed shift or ctrl?
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey
    const isSelected = tr.nodes().indexOf(e.target) >= 0

    if (!metaPressed && !isSelected) {
      // if no key pressed and the node is not selected
      // select just one
      selectShapes([e.target.id()])
    } else if (metaPressed && isSelected) {
      // if we pressed keys and node was selected
      // we need to remove it from selection:
      selectShapes((oldShapes) =>
        oldShapes.filter((oldId) => oldId !== e.target.id())
      )
    } else if (metaPressed && !isSelected) {
      // add the node into selection
      selectShapes((oldShapes) => [...oldShapes, e.target.id()])
    }
    layer.draw()
  }

  return (
    <>
      <FullscreenMockup
        open={isFullScreenMockOpen}
        onOpenChange={setIsFullScreenMockOpen}
      />
      <div className={clsx("p-24px overflow-y-auto pb-100px", className)}>
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
            <div className="w-full h-full min-w-600px flex items-center justify-center relative">
              <Tooltip content="Change mockup color">
                <ToggleButton
                  disableToggle
                  className="absolute left-12px top-12px"
                >
                  <input
                    type="color"
                    className="invisible absolute inset-0"
                    ref={colorPickerRef}
                    onChange={(e) => {
                      setMockupBg(e.target.value)
                    }}
                  />

                  <IconColor
                    className="text-20px"
                    onClick={() => colorPickerRef.current?.click()}
                  />
                </ToggleButton>
              </Tooltip>
              <Stage
                width={stageWidth}
                height={stageHeight}
                ref={stageRef}
                className="size-600px mx-auto bg-transparent"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onClick={onClickTap}
                onTap={onClickTap}
              >
                <Layer listening={false}>
                  <KonvaImage
                    image={image}
                    visible={isMockupShow}
                    fill={mockupBg}
                  />
                  <PrintArea
                    ref={printAreaRef}
                    width={printAreaWidth}
                    height={printAreaHeight}
                    centerX={300}
                    centerY={235} // 600 - 130 = 470, 470/2 = 235
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDashArray={strokeDashArray}
                  />
                </Layer>
                <Layer ref={layerRef}>
                  {shapeList.map((shape, index) => {
                    if (isTextPath(shape)) {
                      return (
                        <TextPath
                          {...shape}
                          key={shape.id}
                          draggable={!isDragMode}
                          onChange={(newAttrs) => {
                            setShapeList((shapes) => {
                              const textPath = new Konva.TextPath(newAttrs)
                              const clientRect = textPath.getClientRect()
                              const { height, width } = clientRect
                              const temp = shapes.slice()
                              temp[index] = {
                                ...newAttrs,
                                width,
                                height
                              } as ShapeConfig
                              return temp
                            })
                          }}
                        />
                      )
                    }
                  })}

                  {!isDragMode && (
                    <>
                      <Transformer
                        ref={trRef}
                        onDeleteHover={() => {
                          const stage = stageRef.current
                          if (!stage) return
                          stage.container().style.cursor = "pointer"
                        }}
                      />
                      <Rect fill="rgba(0,0,255,0.5)" ref={selectionRectRef} />
                    </>
                  )}
                </Layer>
              </Stage>
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
              onValueChange={(e) => setCurrentSwitch(e as SwitchType)}
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
