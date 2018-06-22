import { combineReducers, combineEpics } from "lib/useCase"
import * as todos from "app/todos/use-cases"
import * as routing from "./routing"

export const reducer = combineReducers({
  routing: routing.reducer,
  todos: todos.reducer,
})

export const epic = combineEpics(
  routing.epic,
  todos.epic,
)
