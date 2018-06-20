import { combineEpics, combineReducers } from "lib/useCase"
import { routeEpic } from "app/main/use-cases/router"
import * as todos from "./todos"

export const reducer = combineReducers({
  todos: todos.reducer,
})

export const epic = routeEpic("todos", combineEpics(
  todos.epic,
))
