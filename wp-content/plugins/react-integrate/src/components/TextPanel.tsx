import { canvasEmitter } from "@/bus/fabric"
import { selectedShapeListAtom, shapeListAtom } from "@/store/fabric"
import { isFabricText, toFixed } from "@/utils"
import { Badge, Button, Card, TextArea } from "@radix-ui/themes"
import { useAtomValue } from "jotai/react"
import IconText from "~icons/proicons/text-font"

const TextPanel = () => {
  const shapeList = useAtomValue(shapeListAtom)
  const selectedShapeList = useAtomValue(selectedShapeListAtom)
  const [text, setText] = useState("")

  return (
    <>
      <Button
        className="mb-12px cursor-pointer"
        disabled={selectedShapeList.length != 0}
        onClick={() => {
          const value = "Hello React"
          setText(value)
          canvasEmitter.emit("addText", value)
        }}
      >
        Add text
      </Button>
      <div>
        <TextArea
          disabled={false}
          resize="vertical"
          className="mb-12px"
          rows={8}
          value={text}
          onChange={(e) => {
            const value = e.target.value
            setText(value)
            canvasEmitter.emit("addText", value)
          }}
        />
      </div>

      {/* <Card className="mb-12px">
        <h3 className="mb-12px">激活对象</h3>
        {activeShape
          ? isTextPath(activeShape)
            ? activeShape.text
            : activeShape.type
          : "暂无"}
      </Card> */}

      {shapeList.length > 0 && (
        <>
          <Card>
            <h3 className="mb-12px">画布上的对象</h3>
            <div className="flex flex-col gap-12px">
              {shapeList.map((v, index) => (
                <Card key={index}>
                  <div className="break-all pr-60px">
                    <Badge
                      radius="full"
                      color="gray"
                      className="text-12px font-bold mr-4px"
                    >
                      {v.type}
                    </Badge>
                    {isFabricText(v) && (
                      <span className="text-12px text-#222">{v.text}</span>
                    )}
                  </div>
                  <div className="mt-4px mb-16px text-14px leading-22px">
                    <span className="font-700">Width:</span>
                    <span className="pl-2px text-12px">
                      {toFixed(v.width * v.scaleX)} units
                    </span>
                    <span className="pl-4px font-700">Height:</span>
                    <span className="pl-2px text-12px">
                      {toFixed(v.height * v.scaleY)} units
                    </span>
                  </div>

                  <div className="-mt-14px mb-16px text-14px leading-22px">
                    <span className="font-700">X:</span>
                    <span className="pl-2px text-12px">
                      {toFixed(v.left)} units
                    </span>
                    <span className="pl-4px font-700">Y:</span>
                    <span className="pl-2px text-12px">
                      {toFixed(v.top)} units
                    </span>
                  </div>

                  <div className="-mt-14px mb-16px text-14px leading-22px">
                    <span className="font-700">scaleX:</span>
                    <span className="pl-2px text-12px">
                      {toFixed(v.scaleX)}
                    </span>
                    <span className="pl-4px font-700">scaleY:</span>
                    <span className="pl-2px text-12px">
                      {toFixed(v.scaleY)}
                    </span>
                  </div>

                  <div className="bg-[url('@/assets/images/trasnparent-pattern.png')] bg-repeat bg-center bg-[length:18px] h-[50px] w-[50px] border-1 border-[rgb(229,229,229)] rounded-5px flex items-center justify-center">
                    {isFabricText(v) && <IconText className="text-20px" />}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </>
      )}

      {selectedShapeList.length > 0 && (
        <Card className="mt-12px">
          <h3 className="mb-12px">选中对象</h3>

          {selectedShapeList.map((v, index) => (
            <Card key={index}>{isFabricText(v) ? v.text : v.type}</Card>
          ))}
        </Card>
      )}
    </>
  )
}

export default TextPanel
