import { map as amap, when, propEq, assoc, filter } from 'ramda';
import { map, flatMap, tap } from 'rxjs/operators';

import {
  createAction,
  createReducer,
  combineEpics,
  reducers,
} from '../lib/useCase';

import { INITIALIZE } from '../store/actions';

// Actions
// ---------------------------------------------------------------------------
export const actions = {
  FETCH_TODOS: 'todos/fetch',
  SET_TODOS: 'todos/set',
  UPDATE_TODO: 'todos/update',
  COMPLETE_TODO: 'todos/complete',
};

// Reducer
// ---------------------------------------------------------------------------
export const reducer = createReducer([], {
  [actions.SET_TODOS]: reducers.set,
  [actions.UPDATE_TODO]: reducers.mergeById,
  [actions.REMOVE_TODO]: reducers.removeById,
  [actions.COMPLETE_TODO]: (state, action) =>
    amap(when(
      propEq('id', action.data.id),
      assoc('complete', true),
    )),
});

// Epic
// ---------------------------------------------------------------------------
function initEpic (action$) {
  return action$
    .ofType(INITIALIZE)
    .pipe(
      map(createAction(actions.FETCH_TODOS))
    );
}

function fetchEpic (action$, state$, { request }) {
  return action$
    .ofType(actions.FETCH_TODOS)
    .pipe(
      flatMap(request.GET('/data/todos.json')),
      map(createAction(actions.SET_TODOS))
    );
}

export const epic = combineEpics(
  initEpic,
  fetchEpic,
);

// Selectors
// ---------------------------------------------------------------------------
export const selectIncomplete = filter(propEq('complete', false));
export const selectComplete = filter(propEq('complete', true));
