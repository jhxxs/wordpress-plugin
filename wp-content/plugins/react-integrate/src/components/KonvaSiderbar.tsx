import TextPanel from "./KonvaTextPanel"

const Sidebar: React.FC = () => {
  return (
    <div className="w-400px h-full bg-white overflow-y-auto border-r pb-73px border-hex-e5e5e5 p-16px">
      <TextPanel />
    </div>
  )
}

export default Sidebar
