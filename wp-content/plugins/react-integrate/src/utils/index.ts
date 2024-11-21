import type {
  ImageConfigType,
  ShapeConfig,
  TextPathConfigType
} from "@/store/canvas"

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export function isImage(item: ShapeConfig | null): item is ImageConfigType {
  return item?.type === "image"
}

export function isTextPath(
  item: ShapeConfig | null
): item is TextPathConfigType {
  return item?.type === "textpath"
}

export function isGroup(item: ShapeConfig | null): item is ShapeConfig {
  return item?.type === "group"
}

export const id = () => (crypto ? crypto.randomUUID() : Date.now().toString())

export const toFixed = (value?: number) => value?.toFixed(2)
