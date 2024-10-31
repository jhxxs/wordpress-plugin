const parts = [
  {
    name: "Front"
  },
  {
    name: "Back"
  },
  {
    name: "Outside label"
  },
  {
    name: "Inside label"
  },
  {
    name: "Left sleeve"
  },
  {
    name: "Right sleeve"
  }
]

type PartBtn = (typeof parts)[number]

const Parts: React.FC<{
  className?: string
}> = ({ className }) => {
  const [current, setCurrent] = useState(parts[0])

  function isActive(item: PartBtn) {
    return current.name === item.name
  }

  return (
    <>
      <div className={clsx("flex items-center gap-x-4px", className)}>
        {parts.map((item) => (
          <button
            key={item.name}
            className={clsx(
              "p-12px py-7px rounded-100vmax text-16px font-bold",
              isActive(item)
                ? "text-hex-1164a9 bg-hex-dbf2fa"
                : "text-hex-222 hover:bg-hex-e5e5e5"
            )}
            onClick={() => setCurrent(item)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </>
  )
}

export default Parts
