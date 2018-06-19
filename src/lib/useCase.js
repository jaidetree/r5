import { curry } from 'ramda';
export { combineEpics } from 'redux-observable';
export { combineReducers } from 'redux';
export * as reducers from './reducers';

// createAction :: "a" -> b -> { type: "a", data: b }
// Curried function for creating action objects.
// Example:
// [ 1, 2, 3 ]
//   |> createAction('data/set')
//   // => { type: 'data/set', data: [ 1, 2, 3 ]}
export const createAction = curry(function createAction (type, data, ...args) {
  return {
    type,
    data,
  };
});

// createReducer :: ({ String: ({ State }, { Action }) -> { State }})
// Generate a reducer that maps action types to simple reducer functions
export function createReducer (handlers) {
  return (state, action) => {
    if (handlers[action.type]) {
      return handlers[action.type](state, action);
    }

    // if state is new then return initial value in handlers object
    return typeof state === 'undefined' ? handlers.init : state;
  };
}
