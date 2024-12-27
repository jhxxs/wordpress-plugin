import type { PresetObjectName } from "@/types/fabric"
import { type FabricObject } from "fabric"
import { atom } from "jotai"

type BasicOrArrayProperties<T> = {
  [K in keyof T]: K extends `_${string}`
    ? never
    : T[K] extends
          | PresetObjectName
          | undefined
          | string
          | number
          | boolean
          | unknown[]
      ? K
      : never
}[keyof T]

export type ShapeJSON = Pick<
  FabricObject,
  NonNullable<BasicOrArrayProperties<FabricObject>>
>

/** 画布上的`shape JSON`列表 */
export const shapeListAtom = atom<ShapeJSON[]>([])

/** 选中的`shape`的`id`列表 */
export const selectedIdListAtom = atom<string[]>([])

/** 选中的`shape`列表 */
export const selectedShapeListAtom = atom((get) => {
  const shapList = get(shapeListAtom)
  const ids = get(selectedIdListAtom)
  return shapList.filter((v) => ids.includes(v.id!))
})
