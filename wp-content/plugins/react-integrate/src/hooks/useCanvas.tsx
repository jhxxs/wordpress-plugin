import * as fabric from "fabric"

function useCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    if (!canvasElRef.current) return
    canvasRef.current = new fabric.Canvas(canvasElRef.current, {
      controlsAboveOverlay: true
    })
  }, [])

  return <canvas>Canvas</canvas>
}

export default useCanvas
