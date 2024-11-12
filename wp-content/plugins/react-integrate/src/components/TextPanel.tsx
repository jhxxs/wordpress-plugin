import { canvasEmitter } from "@/bus/canvas"
import { Button, Flex, TextArea } from "@radix-ui/themes"
import { useAtom } from "jotai/react"
import { useResetAtom } from "jotai/utils"
import { canvasAtom } from "@/store/canvas"

const TextPanel = () => {
  const [atom, setAtom] = useAtom(canvasAtom)
  const resetAtom = useResetAtom(canvasAtom)

  return (
    <>
      <div>
        {atom}
        <Flex gapX="1">
          <Button onClick={() => setAtom(atom + 1)}>+1</Button>
          <Button onClick={resetAtom}>reset</Button>
          <Button onClick={() => setAtom(atom - 1)}>-1</Button>
        </Flex>

        <TextArea
          resize="vertical"
          rows={8}
          onChange={(e) => canvasEmitter.emit("addText", e.target.value)}
        />
      </div>
    </>
  )
}

export default TextPanel
