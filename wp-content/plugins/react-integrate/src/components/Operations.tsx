import IconText from "~icons/bxs/edit"
import IconFont from "~icons/ri/font-size-2"
import IconTransform from "~icons/tdesign/transform-1"
import IconMove from "~icons/hugeicons/move"
import IconArc from "~icons/token/arc"
import IconOutline from "~icons/healthicons/t-outline"
import IconShadow from "~icons/mdi/text-shadow"
import IconSave from "~icons/mdi/content-save-plus-outline"
import { Separator } from "@radix-ui/themes"
import { Fragment } from "react"

const Operations: React.FC<{
  className?: string
}> = ({ className }) => {
  const operations = [
    {
      name: "Text",
      icon: IconText
    },
    {
      name: "Color"
    },
    {
      name: "Font",
      icon: IconFont
    },
    {
      name: "Transform",
      icon: IconTransform
    },
    {
      name: "Position",
      icon: IconMove
    },
    {
      name: "Arc",
      icon: IconArc
    },
    {
      name: "Outine",
      icon: IconOutline
    },
    {
      name: "Shadow",
      icon: IconShadow,
      isLast: true
    },
    {
      name: "Save Design",
      icon: IconSave,
      onClick: () => {
        console.log("save design")
      }
    }
  ]
  type OperationBtn = (typeof operations)[number]

  const [current, setCurrent] = useState(operations[0])

  function isActive(item: OperationBtn) {
    return current.name === item.name
  }
  return (
    <>
      <div
        className={clsx(
          "flex items-center gap-x-4px rounded-10px h-48px px-4px bg-white",
          className
        )}
      >
        {operations.map((item) => (
          <Fragment key={item.name}>
            <button
              key={item.name}
              className={clsx(
                "p-12px py-8px rounded-5px flex items-center gap-x-4px",
                isActive(item)
                  ? "text-hex-1164a9 bg-hex-dbf2fa"
                  : "text-hex-222 hover:bg-hex-e5e5e5"
              )}
              onClick={() => {
                if (item.onClick) {
                  item.onClick()
                } else {
                  setCurrent(item)
                }
              }}
            >
              {item.icon && <item.icon className="text-20px flex-shrink-0" />}
              <span className="text-14px font-bold">{item.name}</span>
            </button>
            {item.isLast && (
              <Separator
                orientation="vertical"
                className="!h-[calc(100%-10px)]"
              />
            )}
          </Fragment>
        ))}
      </div>
    </>
  )
}

export default Operations
