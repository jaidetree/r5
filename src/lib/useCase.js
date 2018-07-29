import {
  __,
  both,
  curry,
  has,
  propEq,
} from "ramda"

import {
  pluck,
  filter,
  first,
  flatMap,
  takeUntil,
  tap,
} from "rxjs/operators"

export { combineEpics } from "redux-observable"
export { combineReducers } from "redux"
export * as reducers from "./reducers"

export const INIT_VIEW = "app/view/init"
export const CLEANUP_VIEW = "app/view/cleanup"

/**
 * createAction :: "a" -> b -> { type: "a", data: b }
 * Curried function for creating action objects.
 * Example:
 * [ 1, 2, 3 ]
 *   |> createAction('data/set')
 *   // => { type: 'data/set', data: [ 1, 2, 3 ]}
 */
export const createAction = curry(function createAction (type, data) {
  return {
    type,
    data,
  }
})

/**
 * createReducer :: ({ String: ({ State }, { Action }) -> { State }})
 * Generate a reducer that maps action types to simple reducer functions
 */
export function createReducer (handlers) {
  return (state, action) => {
    if (handlers[action.type]) {
      return handlers[action.type](state, action)
    }

    // if state is new then return initial value in handlers object
    return typeof state === "undefined" ? handlers.init : state
  }
}

/**
 * useEpics :: { string: (Observable, Observable, { a }) -> Observable } ->
               (Observable, Observable, { a }) ->
               Observable
 * Takes a map of epics and returns an epic that dynamically switches epics
 * on and off depending on the view being initialized and cleaned up.
 */
export function useEpics (epics) {
  return (action$, state$, ...args) => action$
    .ofType(INIT_VIEW)
    .pipe(
      pluck("data"),
      filter(has(__, epics)),
      flatMap(view => epics[view](action$, state$, ...args)
        .pipe(takeUntil(action$.pipe(
          first(both(
            propEq("type", CLEANUP_VIEW),
            propEq("data", view),
          ))
        )))
      )
    )
}
