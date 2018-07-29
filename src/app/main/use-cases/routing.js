import {
  apply,
  compose,
  equals,
  not,
  path,
  pipe,
  reverse,
} from "ramda"

import {
  from,
  merge,
} from "rxjs"

import {
  filter,
  ignoreElements,
  map,
  pluck,
  switchMap,
  switchMapTo,
  tap,
  withLatestFrom,
} from "rxjs/operators"

import {
  combineEpics,
  combineReducers,
  createAction,
  createReducer,
  reducers,
  INIT_VIEW,
  CLEANUP_VIEW,
} from "lib/useCase"

import { diffViews, parseRoutes, routeToViews } from "app/main/lib/router"

import { INITIALIZE } from "app/main/store/initialize"

// Actions
// ---------------------------------------------------------------------------
export const actions = {
  START_LOADING: "routing/loading/start",
  STOP_LOADING: "routing/loading/stop",

  SET_ROUTES: "routing/routes/set",

  NAVIGATE: "routing/url/navigate",
  ROUTE: "routing/url/route",

  APPEND_VIEW: "routing/views/append",
  LOADED_VIEW: "routing/view/loaded",

  REMOVE_VIEW: "routing/views/view/remove",
  UPDATE_VIEW: "routing/views/view/update",
  UPDATE_VIEWS: "routing/views/update",
}

export const ROUTE = actions.ROUTE
export const LOADED_VIEW = actions.LOADED_VIEW

// Reducer
// ---------------------------------------------------------------------------
export const reducer = combineReducers({
  routes: createReducer({
    init: [],
    [actions.SET_ROUTES]: reducers.set,
  }),
  views: createReducer({
    init: [],
    [actions.APPEND_VIEW]: reducers.append,
    [actions.UPDATE_VIEW]: reducers.mergeDeepByKey("name"),
    [actions.REMOVE_VIEW]: reducers.removeByKey("name"),
  }),
  loading: createReducer({
    init: [],
    [actions.START_LOADING]: reducers.pipe(
      reducers.append,
      reducers.unique,
    ),
    [actions.STOP_LOADING]: reducers.remove,
  })
})

// Action Creators
// ---------------------------------------------------------------------------

export function initView (view) {
  return { type: INIT_VIEW, data: view }
}

export function cleanupView (view) {
  return { type: CLEANUP_VIEW, data: view }
}

export function navigate (uri) {
  return { type: actions.NAVIGATE, data: uri }
}

export function startLoading (name) {
  return { type: actions.START_LOADING, data: name }
}

export function stopLoading (name) {
  return { type: actions.STOP_LOADING, data: name }
}

// Epics
// ---------------------------------------------------------------------------
function changeUrlEpic (action$, state$, { router$ }) {
  return action$
    .ofType(actions.SET_ROUTES)
    .pipe(
      switchMapTo(router$),
      map(createAction(actions.ROUTE))
    )
}

function initializeEpic (action$) {
  return action$
    .ofType(INITIALIZE)
    .pipe(
      pluck("data", "routes"),
      map(parseRoutes),
      map(createAction(actions.SET_ROUTES)),
    )
}

function navigateEpic (action$, state$, { router$ }) {
  return action$
    .ofType(actions.NAVIGATE)
    .pipe(
      pluck("data"),
      tap(route => router$.navigate(route.url, route.opts)),
      ignoreElements(),
    )
}

function routeEpic (action$, state$) {
  return action$
    .ofType(actions.ROUTE)
    .pipe(
      pluck("data"),
      withLatestFrom(state$.pipe(
        map(select("routes"))
      )),
      switchMap(pipe(reverse, apply(routeToViews))),
      map(createAction(actions.UPDATE_VIEWS))
    )
}

function startLoadingViewEpic (action$) {
  return action$
    .ofType(INIT_VIEW)
    .pipe(
      pluck("data"),
      map(startLoading),
    )
}

function updateViewsEpic (action$, state$) {
  return action$
    .ofType(actions.UPDATE_VIEWS)
    .pipe(
      pluck("data"),
      withLatestFrom(state$.pipe(map(select("views")))),
      filter(apply(compose(not, equals))),
      map(apply(diffViews)),
      switchMap(diff => merge(
        diff.removed$.pipe(map(createAction(actions.REMOVE_VIEW))),
        diff.added$.pipe(map(createAction(actions.APPEND_VIEW))),
        diff.updated$.pipe(map(createAction(actions.UPDATE_VIEW))),
      ))
    )
}

export const epic = combineEpics(
  changeUrlEpic,
  initializeEpic,
  navigateEpic,
  routeEpic,
  startLoadingViewEpic,
  updateViewsEpic,
)

function select (...paths) {
  return path([ "routing", ...paths ])
}
