import { curry } from 'ramda';
export { combineEpics } from 'redux-observable';
export { combineReducers } from 'redux';
export * as reducers from './reducers';

// createAction: "a" -> b -> { type: "a", data: b }
export const createAction = curry(function createAction (type, data, ...args) {
  return {
    type,
    data,
  };
});

export function createReducer (initial, handlers) {
  return (state, action) => {
    if (handlers[action.type]) {
      return handlers[action.type](state, action);
    }

    return typeof state === 'undefined' ? initial : state;
  };
}
