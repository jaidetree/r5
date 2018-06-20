import {
  always,
  pipe,
  propEq,
  pathEq,
} from 'ramda';

import {
  of,
  from,
} from 'rxjs';

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
  withLatestFrom,
} from 'rxjs/operators';

import {
  combineEpics,
  combineReducers,
  createAction,
  createReducer,
  reducers,
} from 'lib/useCase';

import * as Router from 'lib/router';

import { INITIALIZE } from 'app/main/store/initialize';

// Actions
// ---------------------------------------------------------------------------
export const actions = {
  CLEANUP_VIEW: 'router/module/cleanup',
  INIT_VIEW: 'router/view/init',
  NAVIGATE: 'router/url/navigate',
  READY_MODULE: 'router/module/ready',
  REMOVE_VIEW: 'router/views/remove',
  ROUTE: 'router/url/route',
  START_LOADING: 'router/loading/start',
  START_ROUTING: 'router/start',
  STOP_LOADING: 'router/loading/stop',
};

export const ROUTE = actions.ROUTE;
export const START_LOADING = actions.START_LOADING;
export const STOP_LOADING = actions.STOP_LOADING;
export const INIT_VIEW = actions.INIT_VIEW;
export const READY_MODULE = actions.READY_MODULE;
export const CLEANUP_VIEW = actions.CLEANUP_VIEW;

// Reducer
// ---------------------------------------------------------------------------
export const reducer = combineReducers({
  views: createReducer({
    init: [],
    [actions.INIT_VIEW]: reducers.pipe(
      reducers.append,
      reducers.uniqueByKey('name'),
    ),
    [actions.REMOVE_VIEW]: reducers.removeByKey('name'),
  }),
  loading: createReducer({
    init: [],
    [actions.START_LOADING]: reducers.pipe(
      reducers.append,
      reducers.unique,
    ),
    [actions.STOP_LOADING]: reducers.remove,
  })
});

// Action Creators
// ---------------------------------------------------------------------------
export function appendView (view) {
  return { type: actions.APPEND_VIEW, data: view };
}

export function removeView (view) {
  return { type: actions.REMOVE_VIEW, data: view };
}

export function navigate (uri) {
  return { type: actions.NAVIGATE, data: uri };
}

export function startLoading (name) {
  return { type: actions.START_LOADING, data: name };
}

export function startRouting (routes) {
  return { type: actions.START_ROUTING, data: routes };
}

export function stopLoading (name) {
  return { type: actions.STOP_LOADING, data: name };
}

// Epics
// ---------------------------------------------------------------------------
function initializeEpic (action$, state$, { router, window }) {
  return action$
    .ofType(INITIALIZE)
    .pipe(
      switchMap(always(router.route$)),
      map(createAction(actions.ROUTE)),
    );
}

function navigateEpic (action$, state$, { window, router }) {
  return action$
    .ofType(actions.NAVIGATE)
    .pipe(
      pluck('data'),
      tap(route => router.navigate(route.url, route.opts)),
      ignoreElements(),
    );
}

function routingEpic (action$) {
  return action$
    .ofType(actions.START_ROUTING)
    .pipe(
      pluck('data'),
      map(Router.parseRoutes),
      combineLatest(action$.ofType(actions.ROUTE).pipe(pluck('data'))),
      flatMap(([ routes, location ]) => from(routes)
        .pipe(
          tap(log('routing to', location)),
          filter(route => Router.isRoute(route, location)),
          map(route => ({
            path: location.path,
            query: location.query,
            params: Router.getArgsFromURL(route, location),
            name: route.name,
          })),
        )
      ),
      map(createAction(actions.INIT_VIEW)),
    );
}

export const epic = combineEpics(
  initializeEpic,
  navigateEpic,
  routingEpic,
);

// Helpers
// ---------------------------------------------------------------------------
export function handleRoute (patternStr, name) {
  const route = Router.parseRoute(patternStr, name);

  return pipe(
    filter(location => Router.isRoute(route, location)),
    map(location => ({
      path: location.path,
      query: location.query,
      params: Router.getArgsFromURL(route, location),
      name: route.name,
    })),
  );
}

export function routeEpic (name, epic) {
  return (action$, ...args) => action$
    .ofType(INIT_VIEW)
    .pipe(
      filter(pathEq([ 'data', 'name' ], name)),
      switchMap(() => epic(action$, ...args)),
      takeUntil(action$.ofType(CLEANUP_VIEW).pipe(
        filter(propEq('data', name)),
      ))
    );
}
