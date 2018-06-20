import {
  always,
  map as amap,
  pipe,
  propEq,
  pathEq,
} from "ramda"

import {
  from,
} from "rxjs"

import {
  combineLatest,
  filter,
  flatMap,
  ignoreElements,
  map,
  pluck,
  switchMap,
  takeUntil,
  tap,
} from "rxjs/operators"

import {
  combineEpics,
  combineReducers,
  createAction,
  createReducer,
  reducers,
} from "lib/useCase"

import * as Router from "lib/router"

import { INITIALIZE } from "app/main/store/initialize"

// Actions
// ---------------------------------------------------------------------------
export const actions = {
  CLEANUP_VIEW: "router/view/cleanup",
  INIT_VIEW: "router/view/init",
  LOADED_VIEW: "router/view/loaded",
  NAVIGATE: "router/url/navigate",
  REMOVE_VIEW: "router/views/remove",
  ROUTE: "router/url/route",
  ROUTE_VIEW: "router/view/route",
  START_LOADING: "router/loading/start",
  START_ROUTING: "router/start",
  STOP_LOADING: "router/loading/stop",
}

export const ROUTE = actions.ROUTE
export const INIT_VIEW = actions.INIT_VIEW
export const LOADED_VIEW = actions.LOADED_VIEW
export const CLEANUP_VIEW = actions.CLEANUP_VIEW

// Reducer
// ---------------------------------------------------------------------------
export const reducer = combineReducers({
  views: createReducer({
    init: [],
    [actions.ROUTE_VIEW]: reducers.updateOrCreateByKey("name"),
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

export function startRouting (routes) {
  return { type: actions.START_ROUTING, data: routes }
}

export function stopLoading (name) {
  return { type: actions.STOP_LOADING, data: name }
}

// Epics
// ---------------------------------------------------------------------------
function initializeEpic (action$, state$, { router, window }) {
  return action$
    .ofType(INITIALIZE)
    .pipe(
      switchMap(always(router.route$)),
      map(createAction(actions.ROUTE)),
    )
}

function navigateEpic (action$, state$, { window, router }) {
  return action$
    .ofType(actions.NAVIGATE)
    .pipe(
      pluck("data"),
      tap(route => router.navigate(route.url, route.opts)),
      ignoreElements(),
    )
}

function routingEpic (action$) {
  return action$
    .ofType(actions.START_ROUTING)
    .pipe(
      pluck("data"),
      // get list of objects that map paths to view names and components and
      // parse them into route target objects that can be used to match a url
      // later
      map(amap(route => Router.parseRoute(route.path, route.name))),
      // wait for a ROUTE action from the store
      combineLatest(action$.ofType(actions.ROUTE).pipe(pluck("data"))),
      // stream all the routes but filter down to only the routes that match
      flatMap(([ routes, location ]) => from(routes)
        .pipe(
          // test to see if route matches location, keep only those that pass
          filter(route => Router.isRoute(route, location)),
          // build a data structure we can use to render views and fetch
          // required data from the server
          map(route => ({
            path: location.path,
            query: location.query,
            params: Router.getArgsFromURL(route, location),
            name: route.name,
          })),
        )
      ),
      // communicate that we are routing to a view
      map(createAction(actions.ROUTE_VIEW)),
    )
}

function startLoadingViewEpic (action$) {
  return action$
    .ofType(actions.ROUTE_VIEW)
    .pipe(
      pluck("data", "name"),
      map(startLoading),
    )
}

export const epic = combineEpics(
  initializeEpic,
  navigateEpic,
  routingEpic,
  startLoadingViewEpic,
)

// Helpers
// ---------------------------------------------------------------------------
export function handleRoute (patternStr, name) {
  const route = Router.parseRoute(patternStr, name)

  return pipe(
    filter(location => Router.isRoute(route, location)),
    map(location => ({
      path: location.path,
      query: location.query,
      params: Router.getArgsFromURL(route, location),
      name: route.name,
    })),
  )
}

export function routeEpic (name, epic) {
  return (action$, ...args) => action$
    .ofType(actions.ROUTE_VIEW)
    .pipe(
      filter(pathEq([ "data", "name" ], name)),
      switchMap(() => epic(action$, ...args)),
      takeUntil(action$.ofType(CLEANUP_VIEW).pipe(
        filter(propEq("data", name)),
      ))
    )
}
