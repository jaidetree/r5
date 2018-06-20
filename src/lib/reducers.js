import {
  assoc,
  cond,
  curry,
  equals,
  findIndex,
  is,
  merge as mergeRight,
  mergeDeepRight,
  prop,
  propEq,
  reduce,
  reject,
  T,
  uniq,
  uniqBy,
  update,
} from "ramda"

/**
 * lookupKey :: String -> { String: a  -> a}
 * Looks up the key string against an action object. Returns value of key
 * in action.data or action itself.
 * Example:
 * lookupKey('id', { id: 2, data: { id: 1 } }) // => 2
 * lookupKey('id', { data: { id: 1 } }) // => 1
 * lookupKey('id', { data: 1 }) // => 1
 */
const lookupKey = curry(function lookupKey (key, action) {
  const value = action[key] || action.data[key] || action.data

  return key === "id" ? Number(value) : value
})

/**
 * updateUsingKey :: String -> ({ State , { Action }) -> { State } -> Boolean -> { State }}
 * Internal function for updating an item in a collection.
 * Set addIfNonExistent to true to add item to collection if not found.
 * Example:
 * updateUsingKey('id', R.identity)({ a: 1 }, { data: { b: 2 } })
 * // => { a: 1 }
 */
function updateUsingKey (key, fn, shouldAdd) {
  return (state, action) => {
    const index = findIndex(propEq(key, lookupKey(key, action)), state)

    // Item does not exist in collection just return state
    if (index === -1 && !shouldAdd) {
      return state
    }

    // Item does not exist but we should add it to the collection, append it
    if (index === -1 && shouldAdd) {
      return state.concat(action.data)
    }

    const newState = fn(state[index], action.data)

    return cond([
      // if state is an array update it and return an array
      [ is(Array), update(index, newState) ],
      // if state is an object update it and return an object
      [ T, assoc(index, newState) ],
    ])(state)
  }
}

/**
 * set :: ({ a }, { data: * }) -> { a }}
 * Replaces state with action.data
 * Example:
 * set({ a: 1 }, { data: { b: 2 } })
 * // => { b: 2 }
 */
export function set (state, action) {
  return action.data
}

/**
 * merge :: ({ a , { data: * }) -> { a }}
 * Merges action.data shallowly into state
 * Example:
 * merge({ a: 1, b: { c: 2 } }, { data: { b: { d: 3 } } })
 * // => { a: 1, b: { d: 3 } }
 */
export function merge (state, action) {
  return mergeRight(state, action.data)
}

/**
 * mergeDeep :: ({ a , { data: * }) -> { a }}
 * Merges action.data deeply into state
 * Example:
 * mergeDeep({ a: 1, b: { c: 2 } }, { data: { b: { d: 3 } } })
 * // => { a: 1, b: { c: 2, d: 3 } }
 */
export function mergeDeep (state, action) {
  return mergeDeepRight(state, action.data)
}

/**
 * replaceByKey :: String -> ([ { a  ], { data: * }) -> [ { a } ]}
 * Replaces element where action.data[key] matches an item in collection
 * Example:
 * replaceByKey('a')([ { a: 1, b: 2 } ], { data: { a: 1, c: 3 } })
 * // => [ { a: 1, c: 3 } ]
 */
export function replaceByKey (key) {
  return updateUsingKey(key, (current, next) => next)
}

/**
 * replaceById :: ([ { a  ], { data: * }) -> [ { a } ]}
 * Replaces element where action.data.id matches an item in a collection
 * Example:
 * replaceById([ { id: 1, a: 1 } ], { data: { id: 1, b: 2 } })
 * // => [ { id: 1, b: 2 } ]
 */
export const replaceById = replaceByKey("id")

/**
 * mergeByKey :: String -> ([ { a  ], { data: * }) -> [ { a } ]}
 * Example:
 * mergeByKey('id')([ { id: 1, a: 1 } ], { data: { id: 1, b: 2 } })
 * // => [ { id: 1, a: 1, b: 2 } ]
 */
export function mergeByKey (key) {
  return updateUsingKey(key, mergeRight)
}

/**
 * mergeById :: ([ { a }, { data: * }) -> [ { a } ]}
 * Shallow merge action.data into collection where action.data.id is found
 * Example:
 * mergeById([ { id: 1, a: 1 } ], { data: { id: 1, b: 2 } })
 * // => [ { id: 1, a: 1, b: 2 } ]
 */
export const mergeById = mergeByKey("id")

/**
 * mergeDeepByKey :: String -> ([ { a }, { data: * }) -> [ { a } ]}
 * Merges action.data[key] into a collection if element is found within.
 * Example:
 * mergeDeepBy('id')([ { id: 1, a: 1 } ], { data: { id: 1, b: 2 } })
 * // => [ { id: 1, a: 1, b: 2 } ]
 */
export function mergeDeepByKey (key) {
  return updateUsingKey(key, mergeDeepRight)
}

/**
 * mergeDeepById :: ([ { a }  ], { data: * }) -> [ { a } ]}
 * Merges action.data into a collection where action.data.id is found within.
 * Example:
 * mergeDeepById([ { id: 1, a: 1 } ], { data: { id: 1, b: 2 } })
 * // => [ { id: 1, a: 1, b: 2 } ]
 */
export const mergeDeepById = mergeDeepByKey("id")

/**
 * remove :: ([ a ], { data: a }) -> [ a ]
 * Removes an item from a list that matches an existing element
 * Example:
 * remove([1, 2, 3], { data: 2 })
 * // => [1, 3]
 */
export function remove (state, action) {
  return state
    |> reject(equals(action.data))
}

/**
 * removeByKey :: String -> ([ { a  ], { data: * }) -> [ { a } ]}
 * Removes an element from a collection if action.data[key] can be found on
 * an item in the collection.
 * Example:
 * removeByKey('color')([ { color: 'red' }, { color: 'blue' } ], { data: { color: 'red' } })
 * // => [ { color: 'blue' } ]
 * removeByKey('color')([ { color: 'red' }, { color: 'blue' } ], { data: 'red' })
 * // => [ { color: 'blue' } ]
 */
export function removeByKey (key) {
  return (state, action) => state
    |> reject(propEq(key, lookupKey(key, action)))
}

/**
 * removeById :: ([ { a } ], { data: * }) -> [ { a } ]}
 * Removes an element from a collection if the id of action.data.id matches
 * an item in the collection.
 * Example:
 * removeById([ { id: 1 }, { id: 2 } ], { data: 1 })
 * // => [ { id: 2 } ]
 * removeById([ { id: 1 }, { id: 2 } ], { data: { id: 1 } })
 * // => [ { id: 2 } ]
 */
export const removeById = removeByKey("id")

/**
 * updateOrCreateByKey :: String -> ([ { a } ], { data: * }) -> [ { a } ]
 * Updates or creates action.data in a collection
 * Example:
 * updateOrCreateByKey('id')([ { id: 1, color: 'blue' } ], { data: { id: 1, color: 'red' } })
 * // => [ { id: 1, name: 'red' } ]
 * updateOrCreateByKey('id')([ { id: 1, color: 'blue' } ], { data: { id: 2, color: 'red' } })
 * // => [ { id: 1, name: 'blue' }, { id: 2, color: 'red' } ]
 */
export function updateOrCreateByKey (key) {
  return updateUsingKey(key, mergeDeepRight, true)
}

/**
 * updateOrCreateById :: ([ { a } ], { data: * }) -> [ { a } ]
 * Either adds action.data to state list or deeply merge updates existing item
 * Example:
 * updateOrCreateById([ { id: 1, color: 'blue' } ], { data: { id: 1, color: 'red' } })
 * // => [ { id: 1, name: 'red' } ]
 * updateOrCreateById([ { id: 1, color: 'blue' } ], { data: { id: 2, color: 'red' } })
 * // => [ { id: 1, name: 'blue' }, { id: 2, color: 'red' } ]
 */
export const updateOrCreateById = updateOrCreateByKey("id")

/**
 * append :: ([ a ], { data: a }) -> [ a ]
 * Appends action.data to state, returns an array or result of concat method
 * Example:
 * append([ 1, 2 ], { data: 3 })
 * // => [ 1, 2, 3 ]
 */
export function append (state, action) {
  return state.concat(action.data)
}

/**
 * prepend :: ([ a ], { data: a }) -> [ a ]
 * Prepends action.data to state, returns an array
 * Example:
 * prepend([ 1, 2 ], { data: 3 })
 * // => [ 3, 1, 2 ]
 */
export function prepend (state, action) {
  return [ action.data ].concat(state)
}

/**
 * inKey :: String -> (({ a , { data: a }) -> { a }) -> ({ a }, { data: { a }) -> { a }
 * Combinator to apply any above reducers to a particular property of a state
 * object.
 * Example:
 * inKey('color', reducers.set)({ color: 'blue' }, { data: 'green' })
 * // => { color: 'green' }
 */
export function inKey (key, reducer) {
  return (state, action) => state
    |> assoc(key, reducer(state[key], action))
}

/**
 * unique :: ([ a ], _) -> [ a ]
 * Enforce unique values in state
 * Example:
 * unique([ 1, 2, 3, 3, ], _) -> [ 1, 2, 3 ]
 */
export function unique (state) {
  return uniq(state)
}

/**
 * uniqueKey :: String -> ([ { a } ], { data: { a }}) -> [ { a } ]
 * Enforce unique values in a collection by using a key prop of each item
 * Example:
 * uniqueByKey('a')([ { a: 1 }, { a: 1 } ], _)
 * // => [ { a: 1 }]
 */
export function uniqueByKey (key) {
  return (state) => uniqBy(prop(key), state)
}

/**
 * pipe :: (...[ (a, { data: a }) -> a ]) -> (a, { data: a }) -> a
 * Combines reducers together to form a super reducer
 * Example:
 * pipe(append, unique)([ 1, 2, 3], { data: [ 3 ] })
 * // => [ 1, 2, 3 ]
 */
export function pipe (...reducers) {
  return (state, action) => reducers
    |> reduce((state, reducer) => reducer(state, action), state)
}
