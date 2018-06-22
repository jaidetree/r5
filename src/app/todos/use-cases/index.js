import { combineEpics, combineReducers } from "lib/useCase"
import * as todos from "./todos"

export const reducer = combineReducers({
  todos: todos.reducer,
})

export const epic = combineEpics(
  todos.epic,
)
