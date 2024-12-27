import { NavLink } from "react-router"

const list = [
  {
    path: "/react-router",
    text: "React Router Demo"
  },
  {
    path: "/fabricjs",
    text: "FabricJS"
  },
  {
    path: "/konva",
    text: "Konva.js"
  }
]

export default function Root() {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <ul className="border-1px rounded-4px">
        {list.map((item, index) => (
          <li
            key={index}
            className={clsx(index == 0 ? "" : "border-t-1px", "mb-0")}
          >
            <NavLink to={item.path} className="block p-4">
              {item.text}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
