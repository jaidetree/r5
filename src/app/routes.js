import Todos from "./todos/containers/Todos"

export default [
  {
    path: "^/$",
    name: "todos",
    Component: Todos,
  },
  {
    path: "^/todo/:id/$",
    name: "view_todo",
    Component: Todos,
  },
]
