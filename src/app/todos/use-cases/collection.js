import { map as amap, when, propEq, assoc, filter } from 'ramda';
import { of } from 'rxjs';
import { map, flatMap, pluck, tap } from 'rxjs/operators';
import * as todos from 'app/todos/api';
import * as Routes from 'app/main/use-cases/router';

import {
  createAction,
  createReducer,
  combineEpics,
  reducers,
} from 'lib/useCase';

import { INITIALIZE } from 'app/main/store/initialize';

// Actions
// ---------------------------------------------------------------------------
export const actions = {
  COMPLETE_TODO: 'todos/complete',
  CREATE_TODO: 'todos/create',
  FETCH_TODOS: 'todos/fetch',
  REMOVE_TODO: 'todos/remove',
  SET_TODOS: 'todos/set',
  UPDATE_TODO: 'todos/update',
};

// Reducer
// ---------------------------------------------------------------------------
export const reducer = createReducer({
  init: [],
  [actions.SET_TODOS]: reducers.set,
  [actions.CREATE_TODO]: reducers.prepend,
  [actions.UPDATE_TODO]: reducers.mergeById,
  [actions.REMOVE_TODO]: reducers.removeById,
  [actions.COMPLETE_TODO]: (state, action) =>
    amap(when(
      propEq('id', action.data.id),
      assoc('complete', true),
    )),
});

// Action Creators
// ---------------------------------------------------------------------------

export function removeTask (id) {
  return { type: actions.REMOVE_TODO, data: id };
}

export function updateTask (data) {
  return { type: actions.UPDATE_TODO, data };
}

// Epic
// ---------------------------------------------------------------------------
function initEpic (action$) {
  return of(createAction(actions.FETCH_TODOS, {}));
}

function fetchEpic (action$, state$, { request }) {
  return action$
    .ofType(actions.FETCH_TODOS)
    .pipe(
      flatMap(todos.fetch),
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
