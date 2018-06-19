import * as R from 'ramda';
import { fromEvent, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const ARG_PATTERN = /(\/:[_a-zA-Z0-9]+)/g;
const NUM_PATTERN = /^\d+(\.\d+)?$/g;

/**
 * createRouter :: { a  -> { route$: Observable, navigate: (String, { b }) -> void, unsubscribe: () -> void }}
 * Create a router object instance for reacting to URL changes and pushing
 * new state.
 */
export function createRouter (config) {
  const window = config.window || window;
  const location = config.location || window.location;
  const history = config.history || window.history;
  const getURL = R.partial(getURLFromLocation, [ location ]);

  // $ denotes "stream"
  const route$ = new BehaviorSubject(getURL());

  // $$ denotes "stream subscription"
  const popstate$$ = fromEvent(window, 'popstate')
    .pipe(
      map(getURL),
    )
    .subscribe(url => route$.next(url));

  return {
    route$,

    // Push or replace URL state
    navigate (uri, opts={}) {
      const methodName = opts.replace ? 'replaceState' : 'pushState';
      const [ path, queryString='' ] = uri.split('?');

      history[methodName](opts.data || null, opts.title || null, uri);

      return route$.next({
        path,
        query: parseQueryString(queryString),
      });
    },

    // End route streams and dispose subscribers
    unsubscribe () {
      route$.complete();
      popstate$$.unsubscribe();
      return route$.unsubscribe();
    },
  };
}

/**
 * parseRoutes :: { String: String } -> { pattern: RegExp, args: [ String ], route: { route } }
 * Parse a map of routes into an array of objects containing the parsed regex
 * & args array
 */
export function parseRoutes (routes) {
  return routes
    |> R.toPairs
    |> R.map(([ patternStr, name ]) => ({
      pattern: parsePattern(patternStr),
      args: parseArgs(patternStr),
      name,
    }));
}

/**
 * isRoute :: ({ path: String, queryString: { a }}, { name: String, args: [ String ], pattern: RegExp }) -> Boolean
 * Determine if a route object matches a given url.
 */
export function isRoute (route, handler) {
  return handler.pattern.test(route.path);
}

/**
 * parseQueryString :: String -> { String: * }
 * Parses a query string into an object including nested JSON objects.
 */
export function parseQueryString (qs) {
  return qs
    |> R.replace(/^\?/, '')
    |> R.split('&')
    |> R.map(R.pipe(
      R.split('='),
      R.map(decodeURIComponent),
      R.cond([
        [ R.propEq(1, 'true'), R.update(1, true) ],
        [ R.propEq(1, 'false'), R.update(1, false) ],
        [ R.propSatisfies(isJSON, 1), R.adjust(JSON.parse, 1) ],
        [ R.propSatisfies(R.test(NUM_PATTERN), 1), R.adjust(Number, 1) ],
        [ R.T, R.identity ],
      ]),
    ))
    |> R.filter(R.head)
    |> R.fromPairs;
}

/**
 * getArgsFromURL :: String -> Route
 * Return an object with the arguments parsed
 */
export function getArgsFromURL (url, route) {
  return matchAll(route.pattern, url)
    |> R.drop(1)
    |> R.map(R.when(R.test(NUM_PATTERN), Number))
    |> R.zipObj(route.args);
}

/**
 *
 * getURLFromLocation :: ({ pathname: String, search: String }) -> { path: String, query: string }
 * Return a plain javascript object with path and query data.
 */
function getURLFromLocation (location) {
  return {
    path: location.pathname,
    query: parseQueryString(location.search),
  };
}

/**
 * isJSON :: String -> Boolean
 * Returns true if a string appears to be a JSON string like "{\"a\":1}"
 */
function isJSON (str) {
  return str
    |> R.defaultTo('')
    |> R.trim
    |> R.either(
      R.both(R.startsWith('['), R.endsWith(']')),
      R.both(R.startsWith('{'), R.endsWith('}')),
    );
}

/**
 * matchAll :: (RegExp, String) -> [ String ]
 * Returns all subgroup matches using a single pattern.
 */
function matchAll (pattern, str) {
  const matches = pattern.exec(str);

  return matches === null ? [] : matches.concat(matchAll(pattern, str));
 }

/**
 * parseArgs :: String -> [ String ]
 * Return an array of argument names to construct an object with later
 */
function parseArgs (patternStr) {
  return patternStr
    |> R.match(ARG_PATTERN)
    |> R.map(R.drop(2));
}

/**
 * parsePattern :: String -> RegExp
 * Return a RegExp from a pattern string with :arg_name
 */
function parsePattern (patternStr) {
  return patternStr
    |> R.replace(ARG_PATTERN, '\/([^\/]+)')
    |> (str => new RegExp(str, 'gi'));
}
