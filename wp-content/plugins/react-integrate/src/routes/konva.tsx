import { Button, SegmentedControl, Separator, Strong } from "@radix-ui/themes"
import { Fragment, useState } from "react"
import Sticky from "react-stickynode"
// icon
import clsx from "clsx"
import IconUpload from "~icons/ic/baseline-upload"
import IconRedo from "~icons/ic/round-redo"
import IconUndo from "~icons/ic/round-undo"
import IconCloth from "~icons/lsicon/clothes-outline"
import IconLayer from "~icons/material-symbols/layers-outline"
import IconFill from "~icons/mdi/format-color-fill"
import IconText from "~icons/mdi/format-text"
import IconSmile from "~icons/uil/smile"
import Panel from "../components/KonvaPanel"
import Siderbar from "../components/Siderbar"

const rightBtns = ["Design", "Mockups"]
const layers = [
  {
    name: "Product",
    icon: IconCloth
  },
  {
    name: "Uploads",
    icon: IconUpload
  },
  {
    name: "Text",
    icon: IconText
  },
  {
    name: "Clipart",
    icon: IconSmile
  },
  {
    name: "Fill",
    icon: IconFill
  },
  {
    name: "Layers",
    icon: IconLayer
  }
]

type LayerButtonType = (typeof layers)[number]

export function FabricDemo() {
  const [currentPanel, setCurrentPanel] = useState(rightBtns[0])
  const [currentLayer, setCurrentLayer] = useState(layers[0].name)
  const [lastLayer, setLastLayer] = useState(layers[0].name)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full h-full relative pb-73px">
      <Sticky>
        <header
          className={
            "h-73px  border-b border-hex-e5e5e5 py-16px px-24px flex justify-between top-32px bg-white w-full"
          }
        >
          <div className="flex gap-x-24px items-center">
            <h3>T shirt.</h3>
            <Separator orientation="vertical" className="!h-full" />
            <Button variant="soft" color="gray">
              Change Product
            </Button>
          </div>
          <div className="flex gap-x-12px items-center">
            <div className="flex gap-x-16px text-hex-b1b1b1 text-20px">
              <IconUndo />
              <IconRedo />
            </div>
            <Separator orientation="vertical" className="!h-full" />
            <SegmentedControl.Root
              defaultValue={currentPanel}
              size="3"
              value={currentPanel}
              onValueChange={(value) => setCurrentPanel(value)}
            >
              {rightBtns.map((name) => (
                <SegmentedControl.Item value={name} key={name}>
                  <Strong
                    className={currentPanel !== name ? "text-hex-555" : ""}
                  >
                    {name}
                  </Strong>
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </div>
        </header>
      </Sticky>
      <div className="w-full h-full">
        <div className="h-full bg-hex-f8f8f8 flex">
          <div className="flex flex-shrink-0">
            <aside className="flex flex-col gap-y-8px border-r border-hex-e5e5e5 w-73px py-8px px-4px bg-white h-full">
              {layers.map((item) => (
                <Fragment key={item.name}>
                  <LayerButton
                    {...item}
                    isActive={currentLayer === item.name}
                    onClick={(e) => {
                      setCurrentLayer(e.name)
                      setIsOpen(true)
                    }}
                  />
                </Fragment>
              ))}
            </aside>
            <Siderbar />
          </div>
          <Panel className="flex-1" />
        </div>
      </div>

      <footer className="z-2 absolute h-73px border-t  bg-white w-full border-hex-e5e5e5 py-16px px-24px flex justify-between items-center bottom-0 left-0 right-0">
        <div>Hello it is footer</div>
        <div className="flex items-center gap-x-24px">
          <span className="text-hex-555 text-14px">2 out of 5 products</span>
          <Button size="3" color="red">
            Add to cart
          </Button>
        </div>
      </footer>
    </div>
  )
}

const LayerButton: React.FC<
  LayerButtonType & {
    isActive?: boolean
    onClick: (value: LayerButtonType) => void
  }
> = ({ isActive, onClick, ...props }) => {
  return (
    <div
      className={clsx(
        "flex flex-col py-12px items-center justify-center rounded-10px radius-4px cursor-pointer hover:bg-hex-f3f3f3 text-hex-555",
        isActive ? "bg-hex-f3f3f3" : ""
      )}
      onClick={() => onClick(props)}
    >
      <props.icon className="text-20px" />
      <p
        className={clsx(
          "mt-4px text-12px",
          isActive ? "text-hex-222 font-bold" : ""
        )}
      >
        {props.name}
      </p>
    </div>
  )
}
