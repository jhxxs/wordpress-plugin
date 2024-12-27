import type { ShapeJSON } from "@/store/fabric"
import type {
  ImageConfigType,
  ShapeConfig,
  TextPathConfigType
} from "@/store/konva"
import type { FabricImage, FabricText, Group } from "fabric"

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
  // @ts-expect-error type could be `group`
  return item?.type === "group"
}

export const id = () => (crypto ? crypto.randomUUID() : Date.now().toString())

export const toFixed = (value?: number) => value?.toFixed(2)

export const isFabricText = (item: ShapeJSON): item is FabricText =>
  item.type === "text"

export const isFabricGroup = (item: ShapeJSON): item is Group =>
  item.type === "group"

export const isFabricImage = (item: ShapeJSON): item is FabricImage =>
  item.type === "image"
