import mitt from "mitt"

type Events = {
  addText?: string
}

export const canvasEmitter = mitt<Events>()
