import {
  combineEpics,
  createAction,
  createReducer,
} from 'lib/useCase';

import {
  ignoreElements,
} from 'rxjs/operators';

// Actions
// ---------------------------------------------------------------------------
export const actions = {
  NAVIGATE: 'router/url/navigate',
  UPDATE_URL: 'router/url/update',
  APPEND_VIEW: 'router/views/append',
  REMOVE_VIEW: 'router/views/remove',
};

// Reducer
// ---------------------------------------------------------------------------
export const reducer = createReducer({
  init: {
    views: [],
  },
  [actions.APPEND_VIEW]: reducers.useKey('views', reducers.pipe(
    reducers.append,
    reducers.unique,
  )),
  [actions.REMOVE_VIEW]: reducers.useKey('views', reducers.removeByKey('name')),
});

// Action Creators
// ---------------------------------------------------------------------------

// Epics
// ---------------------------------------------------------------------------

function navigateEpic (action$) {
  return action$
    .pipe(ignoreElements);
}

function updateEpic (action$) {
  return action$
    .pipe(ignoreElements);
}

export const epic = combineEpics(
  updateEpic,
  navigateEpic
);
