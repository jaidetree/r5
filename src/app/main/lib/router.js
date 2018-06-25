import * as R from "ramda"
import { empty, from, fromEvent, BehaviorSubject } from "rxjs"
import { filter, map, toArray } from "rxjs/operators"

const ARG_PATTERN = /(\/:[_a-zA-Z0-9]+)/g
const NUM_PATTERN = /^\d+(\.\d+)?$/g

/**
 * createRouter :: { a  -> { Router }}
 * Create a router object instance for reacting to URL changes and pushing
 * new state.
 */
export function createRouter (config={}) {
  const browser = config.window || window
  const location = config.location || browser.location
  const history = config.history || browser.history
  const getURL = R.partial(getURLFromLocation, [ location ])

  // $ denotes "stream"
  const route$ = new BehaviorSubject(getURL())

  // $$ denotes "stream subscription"
  const popstate$$ = fromEvent(browser, "popstate")
    .pipe(
      map(getURL),
    )
    .subscribe(url => route$.next(url))

  return {
    route$,

    routeToViews (routes, location) {
      return from(routes)
        .pipe(
          // test to see if route matches location, keep only those that pass
          filter(route => isRouteHit(route, location)),
          // build a data structure we can use to render views and fetch
          // required data from the server
          map(route => ({
            path: location.path,
            query: location.query,
            params: getArgsFromURL(route, location),
            name: route.name,
          })),
          // collect them all as an array to compare against current views
          toArray(),
        )
    },

    // Push or replace URL state
    navigate (uri, opts={}) {
      const methodName = opts.replace ? "replaceState" : "pushState"

      history[methodName](opts.data || null, opts.title || null, uri)

      return route$.next(getURL())
    },

    // End route streams and dispose subscribers
    unsubscribe () {
      route$.complete()
      popstate$$.unsubscribe()
      return route$.unsubscribe()
    },
  }
}

// diffViews: View a, Observable Obs  => ([a], [a]) -> { added$: Obs[a], removed$: Obs[a], updated$: Obs[a] }
// Takes a list of incoming views and a list of previous views then groups
// them into an object of streams.
// diff = diffViews([ { name: "todo" } ], [ { name: "todos" } ])
// diff.addded$ - Stream of views that were added
// diff.removed$ - Stream of views that were removed
// diff.updated$ - Stream of views that were updated
export function diffViews (next, prev) {
  // Create a list of view names for easier lookups
  const getNames = R.pluck("name")
  const nextNames = getNames(next)
  const prevNames = getNames(prev)

  // isIn :: [ String ] -> { name: String } -> Boolean
  // test if a view's name exists in a list of names
  const isIn = R.curry((viewNames, view) => viewNames.includes(view.name))

  // isNotIn :: [ String ] -> { name: String } -> Boolean
  // test if a view's name does not exist in a list of names
  const isNotIn = R.complement(isIn)

  // byName :: String -> { name: String } -> Boolean
  // Test if the name of an object matches an expected string value. Returns
  // true or false.
  const byName = R.propEq("name")

  // isUpdated :: { name: String, query: {}, params: {} } -> Boolean
  // Test if
  const isUpdated = R.allPass([
    isIn(prevNames),
    R.contains(R.__, next),
    view => !R.equals(
      next.find(byName(view.name)),
      prev.find(byName(view.name)),
    ),
  ])

  return next
    // join with previous views but ensure unique elements
    |> R.union(prev)
    // group views into added, removed$, updated$, or ignored$ arrays
    |> R.groupBy(R.cond([
      [ isNotIn(prevNames), R.always("added$") ],
      [ isNotIn(nextNames), R.always("removed$") ],
      [ isUpdated, R.always("updated$") ],
      [ R.T, R.always("ignored$") ],
    ]))
    // transform each group into a stream
    |> R.map(from)
    // merge with default empty streams to make consumption easier & more
    // deterministic
    |> R.merge({
      added$: empty(),
      removed$: empty(),
      updated$: empty(),
    })
}

/**
 * parseRoute :: (String, String) -> { pattern: RegExp, args: [ String ], route: { route } }
 * Parse a patternStr into a usable route object to handle later
 */
export function parseRoute (patternStr, name) {
  return {
    pattern: parsePattern(patternStr),
    args: parseArgs(patternStr),
    name,
  }
}

/**
 * parseRoutes :: { String: String } -> [ { pattern: RegExp, args: [ String ], route: { route } } ]
 * Parse a map of routes into an array of objects containing the parsed regex
 * & args array
 */
export function parseRoutes (routes) {
  return routes
    |> R.toPairs
    |> R.map(R.apply(parseRoute))
}

/**
 * isRouteHit :: ({ name: String, args: [ String ], pattern: RegExp }, { path: String, queryString: { a } }) -> Boolean
 * Determine if a route object matches a given url.
 */
export function isRouteHit (route, location) {
  return new RegExp(route.pattern).test(location.path)
}

/**
 * parseQueryString :: String -> { String: * }
 * Parses a query string into an object including nested JSON objects.
 */
export function parseQueryString (qs) {
  const valueEquals = R.propEq(1)
  const valueIs = R.propSatisfies(R.__, 1)
  const setValue = R.update(1)
  const adjustValue = R.adjust(R.__, 1)
  const isNumber = R.test(NUM_PATTERN)
  const parseJSON = R.tryCatch(JSON.parse, R.always(null))

  return qs
    |> R.replace(/^\?/, "")
    // split into list of [ "key=value" ] strings
    |> R.split("&")
    |> R.map(R.pipe(
      // decode url-safe string into actual characters
      decodeURIComponent,
      // split each "key=value" into pair of  [ "key", "value" ]
      R.split("="),
      // parse expected value types
      R.cond([
        [ valueEquals("true"),  setValue(true) ],
        [ valueEquals("false"), setValue(false) ],
        [ valueIs(isJSON),      adjustValue(parseJSON) ],
        [ valueIs(isNumber),    adjustValue(Number) ],
        [ R.T, R.identity ],
      ]),
    ))
    // remove any items that don't have a valid "key" in the pair
    |> R.filter(R.head)
    // create an object from array of pairs
    |> R.fromPairs
}

/**
 * getArgsFromURL :: ({ pattern: Regxp, args: [ String ] }, { path: String, query: { a } }) -> { b }
 * Return an object with the arguments parsed into a named object
 */
export function getArgsFromURL (route, location) {
  return matchAll(new RegExp(route.pattern), location.path)
    |> R.drop(1)
    |> R.map(R.when(R.test(NUM_PATTERN), Number))
    |> R.zipObj(route.args)
}

/**
 * getURLFromLocation :: ({ pathname: String, search: String }) -> { path: String, query: string }
 * Return a plain javascript object with path and query data.
 */
export function getURLFromLocation (location) {
  return {
    path: location.pathname,
    query: parseQueryString(location.search),
  }
}

/**
 * isJSON :: String -> Boolean
 * Returns true if a string appears to be a JSON string like "{\"a\":1}"
 */
function isJSON (str) {
  return str
    |> R.defaultTo("")
    |> R.trim
    |> R.either(
      R.both(R.startsWith("["), R.endsWith("]")),
      R.both(R.startsWith("{"), R.endsWith("}")),
    )
}

/**
 * matchAll :: (RegExp, String) -> [ String ]
 * Returns all subgroup matches using a single pattern.
 */
function matchAll (pattern, str) {
  const matches = pattern.exec(str)

  return matches === null ? [] : matches.concat(matchAll(pattern, str))
}

/**
 * parseArgs :: String -> [ String ]
 * Return an array of argument names to construct an object with later
 */
function parseArgs (patternStr) {
  return patternStr
    |> R.match(ARG_PATTERN)
    |> R.map(R.drop(2))
}

/**
 * parsePattern :: String -> RegExp
 * Return a RegExp from a pattern string with :arg_name
 */
function parsePattern (patternStr) {
  return patternStr
    |> R.replace(ARG_PATTERN, "/([^/]+)")
    |> (str => new RegExp(str, "gi"))
}
