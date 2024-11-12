import { Canvas, TEvent, TPointerEvent } from "fabric"

declare module "fabric" {
  interface Canvas {
    _dragHandlers?: {
      "mouse:down": (e: TEvent) => void
      "mouse:move": (e: TEvent) => void
      "mouse:up": (e: TEvent) => void
    }
  }

  // 如果需要扩展事件类型
  interface TPointerEventInfo {
    absolutePointer: Point
    button?: number
    isClick?: boolean
    pointer: Point
    target?: Object
    transform?: Transform
  }

  // 如果需要扩展事件处理器类型
  interface TEventHandlers {
    "mouse:down": (e: TEvent) => void
    "mouse:move": (e: TEvent) => void
    "mouse:up": (e: TEvent) => void
    "mouse:wheel": (e: TEvent) => void
    // ... 其他事件类型
  }
}
