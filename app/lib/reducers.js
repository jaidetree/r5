import {
  curry,
  either,
  filter,
  findIndex,
  identity,
  merge as mergeRight,
  mergeDeepRight,
  prop,
  propEq,
  reject,
  update,
} from 'ramda';

const getKey = curry(function getKey (key, action) {
  return action[key] || action.data[key];
});

export function updateUsingKey (key, fn, addIfNonExistent) {
  return (state, action) => {
    const index = findIndex(propEq('id', getKey(key, action)));

    if (index === -1 && !addIfNonExistent) {
      return state;
    }

    if (index === -1 && addIfNonExistent) {
      return state.concat(action.data);
    }

    return update(index, fn(state[index], action.data), state);
  };
}

export function set (state, action) {
  return action.data;
}

export function merge (state, action) {
  return mergeRight(state, action.data);
}

export function mergeDeep (state, action) {
  return mergeDeepRight(state, action.data);
}
export function replaceByKey (key) {
  return updateUsingKey(key, (current, next) => next);
}

export const replaceById = replaceByKey('id');

export function mergeByKey (key) {
  return updateUsingKey(key, merge);
}

export const mergeById = mergeByKey('id');

export function mergeDeepByKey (key) {
  return updateUsingKey(key, mergeDeepRight);
}

export const mergeDeepById = mergeDeepByKey('id');

export function removeByKey (key) {
  return (state, action) => reject(propEq(
    key,
    getKey(key, data)
  ), state);
}

export const removeById = removeByKey('id');

export function updateOrCreateByKey (key) {
  return updateUsingKey(key, mergeDeepRight, true);
}

export const updateOrCreateById = updateOrCreateByKey('id');

export function append (state, action) {
  return state.concat(action.data);
}

export function prepend (state, action) {
  return [ action.data ].concat(state);
}
