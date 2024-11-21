import { forwardRef } from "react"
import { Group, Line, Rect, Text } from "react-konva"

interface PrintAreaProps {
  width: number
  height: number
  centerX: number
  centerY: number
  stroke: string
  strokeWidth: number
  strokeDashArray: number[]
  /** 网格是否默认可见 */
  defaultVisible?: boolean
}

export interface PrintAreaRef {
  showGrid: () => void
  hideGrid: () => void
  toggleGrid: (visible: boolean) => void
  showBottomText: () => void
  hideBottomText: () => void
  showAll: () => void
  hideAll: () => void
}

const PrintArea = forwardRef<PrintAreaRef, PrintAreaProps>(
  (
    {
      width,
      height,
      centerX,
      centerY,
      stroke = "#04d1c6",
      strokeWidth = 1.5,
      strokeDashArray = [1.5, 3],
      defaultVisible = false
    },
    ref
  ) => {
    // 计算位置
    const left = centerX - width / 2
    const top = centerY - height / 2

    const [isGridVisible, setIsGridVisible] = useState(defaultVisible)
    const [isBottomTextVisible, setIsBottomTextVisible] = useState(false)

    function toggleGrid(visible: boolean) {
      setIsGridVisible(visible)
      if (!visible) {
        setIsBottomTextVisible(false)
      }
    }

    function showGrid() {
      setIsGridVisible(true)
    }

    function hideGrid() {
      setIsGridVisible(false)
    }

    function showBottomText() {
      setIsBottomTextVisible(true)
    }

    function hideBottomText() {
      setIsBottomTextVisible(false)
    }

    function showAll() {
      showGrid()
      showBottomText()
    }

    function hideAll() {
      hideGrid()
      hideBottomText()
    }

    useImperativeHandle(ref, () => ({
      showGrid,
      hideGrid,
      toggleGrid,
      showBottomText,
      hideBottomText,
      showAll,
      hideAll
    }))

    return (
      <>
        <Group visible={isGridVisible} name="PrintAreaGrid">
          {/* 水平线 */}
          <Line
            points={[left, centerY, left + width, centerY]}
            stroke={stroke}
            strokeWidth={strokeWidth}
            dashEnabled
            dash={strokeDashArray}
            listening={false}
            strokeScaleEnabled={false}
          />

          {/* 垂直线 */}
          <Line
            points={[centerX, top, centerX, top + height]}
            stroke={stroke}
            strokeWidth={strokeWidth}
            dashEnabled
            dash={strokeDashArray}
            listening={false}
            strokeScaleEnabled={false}
          />

          {/* 外框 */}
          <Rect
            x={left}
            y={top}
            width={width}
            height={height}
            stroke={stroke}
            strokeWidth={strokeWidth}
            dashEnabled
            dash={strokeDashArray}
            listening={false}
            strokeScaleEnabled={false}
          />
        </Group>

        {/* Print Area 文字 */}
        <Group>
          <Rect
            x={left}
            y={top + height + 2}
            width={width}
            height={20}
            fill={stroke}
            visible={isBottomTextVisible}
          />
          <Text
            x={left}
            y={top + height + 2}
            width={width}
            text="Print area"
            fontSize={14}
            fill="#fff"
            fontFamily="Arial"
            align="center"
            visible={isBottomTextVisible}
            name="PrintAreaText"
            listening={false}
            fillAfterStrokeEnabled
            fillEnabled
            backgroundColor="#17bcb5"
            padding={4}
          />
        </Group>
      </>
    )
  }
)

export default PrintArea
