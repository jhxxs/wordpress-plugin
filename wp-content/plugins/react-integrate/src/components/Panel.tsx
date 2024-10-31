import clsx from "clsx"
import Operations from "./Operations"
import Parts from "./Parts"
import { SegmentedControl, Select, Separator, Tooltip } from "@radix-ui/themes"
import * as Slider from "@radix-ui/react-slider"
import IconHand from "~icons/material-symbols/back-hand-outline"
import IconImage from "~icons/material-symbols/image-outline"
import IconMockup from "~icons/iconoir/plus-square-dashed"
import IconPlacement from "~icons/mdi/view-dashboard-outline"
import IconFullscreen from "~icons/gridicons/fullscreen"
import IconGrid from "~icons/lucide/grid-2x2"
import FullscreenMockup from "./FullscreenMockup"

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
]

const Panel: React.FC<{
  children?: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  const [currentSwitch, setCurrentSwitch] = useState(switchs[0].value)

  const ratioMin = ratios[0]
  const ratioMax = ratios[ratios.length - 1]
  const [ratio, setRatio] = useState(0)
  const [ratioSelect, setRatioSelect] = useState(0)
  const [isFullScreenMockOpen, setIsFullScreenMockOpen] = useState(false)

  const rightBtns = [
    {
      title: "Placement",
      icon: IconPlacement
    },
    {
      title: "Fullscreen preview",
      icon: IconFullscreen,
      onClick: () => setIsFullScreenMockOpen(true)
    },
    {
      title: "Grid",
      icon: IconGrid
    }
  ]

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
          <div className="border-b border-hex-e5e5e5 h-600px relative">
            <div className="absolute right-12px top-12px p-3px rounded-5px bg-white flex flex-col gap-y-4px">
              {rightBtns.map((v) => (
                <Tooltip
                  key={v.title}
                  content={
                    <span className="px-8px py-6px text-14px block">
                      {v.title}
                    </span>
                  }
                  sideOffset={15}
                  delayDuration={10}
                  side="right"
                  style={
                    {
                      "--space-4": "8px",
                      "--cursor-button": "pointer"
                    } as React.CSSProperties
                  }
                >
                  <button
                    className="p-8px rounded-5px hover:bg-hex-e5e5e5 text-20px"
                    onClick={v.onClick}
                  >
                    <v.icon />
                  </button>
                </Tooltip>
              ))}
            </div>
            <div className="bg-red-2 w-full h-full"></div>
          </div>
          <div className="flex justify-center items-center px-16px h-56px">
            <Slider.Root
              className="relative flex-shrink-0 flex h-5 w-[240px] touch-none select-none items-center mr-16px"
              defaultValue={[ratio]}
              step={1}
              min={ratioMin}
              max={ratioMax}
              value={[ratio]}
              onValueChange={(value) => setRatio(value[0])}
            >
              <Slider.Track className="relative h-4px grow rounded-full bg-hex-e5e5e5">
                <Slider.Range className="absolute h-full rounded-full " />
              </Slider.Track>
              <Slider.Thumb
                className="block size-24px rounded-24px bg-white border-1px border-hex-ccc shadow-[0_2px_4px_0] shadow-black shadow-opacity-7 focus:outline-none cursor-pointer"
                aria-label="ratio"
              />
            </Slider.Root>

            <Select.Root
              size="3"
              defaultValue={ratioSelect.toString()}
              onValueChange={(e) => {
                setRatio(+e)
                setRatioSelect(+e)
              }}
            >
              <Select.Trigger className="w-96px!">
                <span className="text-14px">{ratio}%</span>
              </Select.Trigger>
              <Select.Content>
                {[...ratios].reverse().map((item) => (
                  <Select.Item key={item} value={item.toString()}>
                    <span className="text-14px">{item}%</span>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <button className="size-40px flex items-center justify-center cursor-not-allowed ml-8px">
              <IconHand className="text-hex-b1b1b1 text-20px " />
            </button>

            <Separator
              orientation="vertical"
              className="!h-[calc(100%-15px)] mx-16px"
            />

            <SegmentedControl.Root
              defaultValue={currentSwitch}
              size="3"
              value={currentSwitch}
              onValueChange={setCurrentSwitch}
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
                    content={
                      <span className="px-8px py-6px text-14px block">
                        {title}
                      </span>
                    }
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
