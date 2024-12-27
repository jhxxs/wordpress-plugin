import { canvasEmitter } from "@/bus/fabric"
import {
  selectedIdListAtom,
  selectedShapeListAtom,
  shapeListAtom
} from "@/store/fabric"
import { id, isFabricText } from "@/utils"
import * as Slider from "@radix-ui/react-slider"
import {
  Button,
  DropdownMenu,
  SegmentedControl,
  Separator
} from "@radix-ui/themes"
import clsx from "clsx"
import type { FabricObject, TextProps } from "fabric"
import { FabricText } from "fabric"
import { useAtomValue, useSetAtom } from "jotai/react"
import { useMount } from "react-use"
import IconFullscreen from "~icons/gridicons/fullscreen"
import IconMockup from "~icons/iconoir/plus-square-dashed"
import IconGrid from "~icons/iconoir/square-dashed"
import IconHand from "~icons/material-symbols/back-hand"
import IconHandOutline from "~icons/material-symbols/back-hand-outline"
import IconImage from "~icons/material-symbols/image-outline"
import IconPlacement from "~icons/mdi/view-dashboard-outline"
import { type FabricCanvasRef, FabricCanvas } from "./FabricCanvas"
import FullscreenMockup from "./FullscreenMockup"
import Operations from "./Operations"
import ToggleButton from "./ToggleButton"
import Tooltip from "./Tooltip"

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
  const fabricCanvasRef = useRef<FabricCanvasRef>(null)

  const [currentSwitch, setCurrentSwitch] = useState<SwitchType>(
    switchs[0].value
  )
  const isMockupShow = currentSwitch === "show"

  const ratioMin = ratios[0]
  const ratioMax = ratios[ratios.length - 1]
  const [ratio, setRatio] = useState(0)
  const isZooming = ratio > 0

  const [isDragMode, setIsDragMode] = useState(false)
  const [isPrintAreaGridVisible, setIsPrintAreaGridVisible] = useState(false)

  const [isFullScreenMockOpen, setIsFullScreenMockOpen] = useState(false)

  const setShapeList = useSetAtom(shapeListAtom)
  const selectedShapeList = useAtomValue(selectedShapeListAtom)
  const setSelectedIdList = useSetAtom(selectedIdListAtom)

  useMount(() => {
    console.log("mounted")

    return () => {
      canvasEmitter.off("addText")
      console.log("unmount")
    }
  })

  const rightBtns = [
    {
      title: "Placement",
      icon: IconPlacement,
      onClick: () => {
        const canvas = fabricCanvasRef.current?.canvas
        fabricCanvasRef.current?.exportImage()
        if (!canvas) return
        console.log("canvas", fabricCanvasRef.current)
        console.log(canvas?.toJSON())
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
      onClick: (checked: boolean) => setIsPrintAreaGridVisible(checked)
    }
  ]

  useEffect(() => {
    if (ratio === 0) {
      setIsDragMode(false)
    }
  }, [ratio])

  const addText = useCallback(
    (str?: string, options?: Partial<TextProps>) => {
      const canvas = fabricCanvasRef.current?.canvas
      // console.log("addText", str, canvas)
      if (!canvas) return
      const defaultOptions: Partial<TextProps> = {
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#000000",
        id: id(),
        ...options
      }

      const item = selectedShapeList[0]

      if (selectedShapeList.length == 1 && isFabricText(item)) {
        canvas.forEachObject((el) => {
          if (el.id === item.id) {
            el.set({ text: str })
          }
        })
      } else {
        const text = new FabricText(str || "", { ...defaultOptions })
        const { width, height } = text.getBoundingRect()
        text.set({
          left: canvas.width / 2 - width / 2,
          top: canvas.height / 2 - height / 2
        })
        canvas.add(text)
        canvas.setActiveObject(text)
      }

      canvas.requestRenderAll()
    },
    [selectedShapeList]
  )

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
              <FabricCanvas
                ref={fabricCanvasRef}
                className="size-600px mx-auto"
                isDragMode={isDragMode}
                ratio={ratio}
                isPrintAreaGridVisible={isPrintAreaGridVisible}
                isMockupVisible={isMockupShow}
                onAdd={(e) => setShapeList((state) => [...state, e.toJSON()])}
                onRemove={(id) =>
                  setShapeList((state) => state.filter((v) => v.id !== id))
                }
                onSelect={(e) => setSelectedIdList(e.map((v) => v.id!))}
                onScale={(e) => {
                  if (e.type === "activeselection") {
                    const objects = e.getObjects()
                    const map = objects.reduce<Record<string, FabricObject>>(
                      (acc, cur) => ({ ...acc, [cur.id!]: cur }),
                      {}
                    )

                    setShapeList((state) =>
                      state.map((v) => {
                        const item = map[v.id!]

                        if (item) {
                          const data = {
                            id: item.id,
                            scaleX: item.scaleX * e.scaleX,
                            scaleY: item.scaleY * e.scaleY,
                            left: item.left * e.scaleX,
                            top: item.top * e.scaleY
                          }
                          Object.assign(v, data)
                        }
                        return v
                      })
                    )
                  } else if (e.id) {
                    setShapeList((state) =>
                      state.map((v) => (v.id === e.id ? e.toJSON() : v))
                    )
                  }
                }}
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
              onValueChange={(e) => setRatio(e[0])}
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
                    onClick={() => setRatio(item)}
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
                onClick={() => setIsDragMode((e) => !e)}
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
              onValueChange={(e: SwitchType) => setCurrentSwitch(e)}
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
