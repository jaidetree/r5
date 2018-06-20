import {
  always,
  pipe,
} from 'ramda';

import {
  combineEpics,
  combineReducers,
  createAction,
  createReducer,
  reducers,
} from 'lib/useCase';

import {
  filter,
  ignoreElements,
  map,
  pluck,
  switchMap,
  tap,
} from 'rxjs/operators';

import * as Router from 'lib/router';

import { INITIALIZE } from 'app/main/store/initialize';

// Actions
// ---------------------------------------------------------------------------
export const actions = {
  NAVIGATE: 'router/url/navigate',
  ROUTE: 'router/url/route',
  APPEND_VIEW: 'router/views/append',
  REMOVE_VIEW: 'router/views/remove',
  START_LOADING: 'router/loading/start',
  STOP_LOADING: 'router/loading/stop',
};

export const ROUTE = actions.ROUTE;
export const START_LOADING = actions.START_LOADING;
export const STOP_LOADING = actions.STOP_LOADING;

// Reducer
// ---------------------------------------------------------------------------
export const reducer = combineReducers({
  views: createReducer({
    init: [],
    [actions.APPEND_VIEW]: reducers.pipe(
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

export const epic = combineEpics(
  initializeEpic,
  navigateEpic
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
