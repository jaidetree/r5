import * as R  from "ramda"
import {
  of,
} from "rxjs"
import {
  delay,
  flatMap,
  map,
  mapTo,
} from "rxjs/operators"
import * as todos from "app/todos/api"
import { INIT_VIEW, stopLoading } from "app/main/use-cases/routing"

import {
  createAction,
  createReducer,
  combineEpics,
  reducers,
} from "lib/useCase"

// Actions
// ---------------------------------------------------------------------------
export const actions = {
  COMPLETE_TODO: "todos/complete",
  CREATE_TODO: "todos/create",
  FETCH_TODOS: "todos/fetch",
  REMOVE_TODO: "todos/remove",
  SET_TODOS: "todos/set",
  UPDATE_TODO: "todos/update",
}

// Reducer
// ---------------------------------------------------------------------------
export const reducer = createReducer({
  init: [],
  [actions.SET_TODOS]: reducers.set,
  [actions.CREATE_TODO]: reducers.prepend,
  [actions.UPDATE_TODO]: reducers.mergeById,
  [actions.REMOVE_TODO]: reducers.removeById,
  [actions.COMPLETE_TODO]: (state, action) =>
    R.map(R.when(
      R.propEq("id", action.data.id),
      R.assoc("complete", true),
    )),
})

// Action Creators
// ---------------------------------------------------------------------------

export function removeTask (id) {
  return { type: actions.REMOVE_TODO, data: id }
}

export function updateTask (data) {
  return { type: actions.UPDATE_TODO, data }
}

// Epic
// ---------------------------------------------------------------------------
function initEpic () {
  return of(createAction(actions.FETCH_TODOS, {}))
}

function fetchEpic (action$) {
  return action$
    .ofType(actions.FETCH_TODOS)
    .pipe(
      flatMap(todos.fetch),
      map(createAction(actions.SET_TODOS))
    )
}

function stopLoadingEpic (action$) {
  return action$
    .ofType(actions.SET_TODOS)
    .pipe(
      delay(1500),
      mapTo("todos"),
      map(stopLoading),
    )
}

export const epic = combineEpics(
  initEpic,
  fetchEpic,
  stopLoadingEpic,
)

// Selectors
// ---------------------------------------------------------------------------
export const selectIncomplete = R.filter(R.propEq("complete", false))
export const selectComplete = R.filter(R.propEq("complete", true))
