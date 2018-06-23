import {
  always,
  apply,
  map as amap,
  path,
  pipe,
  propEq,
  pathEq,
  reverse,
} from "ramda"

import {
  from,
  merge,
} from "rxjs"

import {
  combineLatest,
  filter,
  flatMap,
  ignoreElements,
  map,
  pluck,
  switchMap,
  switchMapTo,
  takeUntil,
  tap,
  withLatestFrom,
} from "rxjs/operators"

import {
  combineEpics,
  combineReducers,
  createAction,
  createReducer,
  reducers,
} from "lib/useCase"

import { parseRoutes } from "app/main/lib/router"

import { INITIALIZE } from "app/main/store/initialize"

// Actions
// ---------------------------------------------------------------------------
export const actions = {
  APPEND_VIEW: "routing/views/append",
  CLEANUP_VIEW: "routing/view/cleanup",
  INIT_VIEW: "routing/view/init",
  LOADED_VIEW: "routing/view/loaded",
  NAVIGATE: "routing/url/navigate",
  REMOVE_VIEW: "routing/views/remove",
  ROUTE: "routing/url/route",
  SET_ROUTES: "routing/routes/set",
  START_LOADING: "routing/loading/start",
  STOP_LOADING: "routing/loading/stop",
}

export const ROUTE = actions.ROUTE
export const INIT_VIEW = actions.INIT_VIEW
export const LOADED_VIEW = actions.LOADED_VIEW
export const CLEANUP_VIEW = actions.CLEANUP_VIEW

// Reducer
// ---------------------------------------------------------------------------
export const reducer = combineReducers({
  routes: createReducer({
    init: [],
    [actions.SET_ROUTES]: reducers.set,
  }),
  views: createReducer({
    init: [],
    [actions.APPEND_VIEW]: reducers.updateOrCreateByKey("name"),
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
  return { type: actions.INIT_VIEW, data: view }
}

export function cleanupView (view) {
  return { type: actions.CLEANUP_VIEW, data: view }
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
function initializeEpic (action$) {
  return action$
    .ofType(INITIALIZE)
    .pipe(
      tap(log("receiving routes")),
      pluck("data", "routes"),
      map(parseRoutes),
      map(createAction(actions.SET_ROUTES)),
    )
}

function navigateEpic (action$, state$, { router }) {
  return action$
    .ofType(actions.NAVIGATE)
    .pipe(
      pluck("data"),
      tap(route => router.navigate(route.url, route.opts)),
      ignoreElements(),
    )
}

function startLoadingViewEpic (action$) {
  return action$
    .ofType(actions.INIT_VIEW)
    .pipe(
      pluck("data"),
      map(startLoading),
    )
}

function routingEpic (action$, state$, { router }) {
  const requestEpic = action$
    .ofType(actions.SET_ROUTES)
    .pipe(
      switchMapTo(router.route$),
      map(createAction(actions.ROUTE)),
    )

  const responseEpic = action$
    .ofType(actions.ROUTE)
    .pipe(
      pluck("data"),
      withLatestFrom(state$.pipe(
        map(path([ "routing", "routes" ]))
      )),
      switchMap(pipe(reverse, apply(router.routeToViews))),
      map(createAction(actions.APPEND_VIEW))
    )


  return merge(requestEpic, responseEpic)
}

export const epic = combineEpics(
  initializeEpic,
  navigateEpic,
  routingEpic,
  startLoadingViewEpic,
)
