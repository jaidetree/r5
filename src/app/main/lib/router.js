import * as R from "ramda"
import { from, fromEvent, BehaviorSubject } from "rxjs"
import { filter, map } from "rxjs/operators"

const ARG_PATTERN = /(\/:[_a-zA-Z0-9]+)/g
const NUM_PATTERN = /^\d+(\.\d+)?$/g

/**
 * createRouter :: { a  -> { route$: Observable, navigate: (String, { b }) -> void, unsubscribe: () -> void }}
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
      debugger;
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
    |> R.split("&")
    |> R.map(R.pipe(
      R.split("="),
      R.map(decodeURIComponent),
      R.cond([
        [ valueEquals("true"),  setValue(true) ],
        [ valueEquals("false"), setValue(false) ],
        [ valueIs(isJSON),      adjustValue(parseJSON) ],
        [ valueIs(isNumber),    adjustValue(Number) ],
        [ R.T, R.identity ],
      ]),
    ))
    |> R.filter(R.head)
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
