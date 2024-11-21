import { atom } from "jotai"
import { atomWithReset } from "jotai/utils"
import type { Group } from "konva/lib/Group"
import type { Shape } from "konva/lib/Shape"
import type { ImageConfig } from "konva/lib/shapes/Image"
import type { TextConfig } from "konva/lib/shapes/Text"
import type { TextPathConfig } from "konva/lib/shapes/TextPath"

export const canvasAtom = atomWithReset(1)

export interface TextPathConfigType extends TextPathConfig {
  type: "textpath"
}

export interface ImageConfigType extends ImageConfig {
  type: "image"
}

export type ShapeConfig = TextPathConfigType | ImageConfigType

/** 画布上的`shape`列表 */
export const shapeListAtom = atomWithReset<ShapeConfig[]>([])

/** 画布选中的`shape`列表 */
export const selectedShapeListAtom = atomWithReset<ShapeConfig[]>([])

/** 画布上激活的`shape` */
export const activeShapeAtom = atom<ShapeConfig | null>(null)

/** 画布上选中的`shape`的`id`列表 */
export const selectedIdsAtom = atom<string[]>([])
