import {
  activeShapeAtom,
  selectedShapeListAtom,
  shapeListAtom,
  TextPathConfigType
} from "@/store/canvas"
import { id, isTextPath, toFixed } from "@/utils"
import { Badge, Card, TextArea } from "@radix-ui/themes"
import { useAtom } from "jotai/react"
import IconText from "~icons/proicons/text-font"

const textDefaultConfig: TextPathConfigType = {
  type: "textpath",
  fontFamily: "Arial",
  fontSize: 36,
  fontStyle: "bold",
  fill: "#000",
  x: 300,
  y: 235,
  data: "M -100,0 L 100,0",
  offsetX: 0,
  offsetY: 0
}

const TextPanel = () => {
  const [shapeList, setShapeList] = useAtom(shapeListAtom)
  const [selectedShapeList, setSelectedShapeList] = useAtom(
    selectedShapeListAtom
  )
  const [activeShape, setActiveShape] = useAtom(activeShapeAtom)

  function handleChangeText(text: string) {
    console.log("handleChangeText", text)

    if (activeShape) {
      setShapeList((state) => {
        const index = state.findIndex((v) => v.id === activeShape.id)
        if (index != -1 && isTextPath(activeShape)) {
          state[index] = {
            ...state[index],
            text
          }
          setActiveShape(state[index])
        }
        return state
      })
    } else {
      const config: TextPathConfigType = {
        ...textDefaultConfig,
        text,
        id: id()
      }

      setActiveShape(config)
      setShapeList((state) => [...state, config])
    }

    console.log(activeShape)
  }

  return (
    <>
      <div>
        <TextArea
          disabled={false}
          resize="vertical"
          className="mb-12px"
          rows={8}
          onChange={(e) => handleChangeText(e.target.value)}
        />
      </div>

      <Card className="mb-12px">
        <h3 className="mb-12px">激活对象</h3>
        {activeShape
          ? isTextPath(activeShape)
            ? activeShape.text
            : activeShape.type
          : "暂无"}
      </Card>

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
                    <span className="text-12px text-#222">{v.text}</span>
                  </div>
                  <div className="mt-4px mb-16px text-14px leading-22px">
                    <span className="font-700">Width:</span>
                    <span className="pl-2px text-12px">
                      {toFixed(v.width)} units
                    </span>
                    <span className="pl-4px font-700">Height:</span>
                    <span className="pl-2px text-12px">
                      {toFixed(v.height)} units
                    </span>
                  </div>
                  <div className="bg-[url('@/assets/images/trasnparent-pattern.png')] bg-repeat bg-center bg-[length:18px] h-[50px] w-[50px] border-1 border-[rgb(229,229,229)] rounded-5px flex items-center justify-center">
                    {isTextPath(v) && <IconText className="text-20px" />}
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
            <Card key={index}>{isTextPath(v) ? v.text : v.type}</Card>
          ))}
        </Card>
      )}
    </>
  )
}

export default TextPanel
