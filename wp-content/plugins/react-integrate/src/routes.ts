import { type RouteConfig, route } from "@react-router/dev/routes"

export default [
  route("/", "./routes/root.tsx", []),
  route("/konva", "./routes/konva.tsx"),
  route("/fabricjs", "./routes/fabric-demo.tsx")
  // pattern ^           ^ module file
] satisfies RouteConfig
