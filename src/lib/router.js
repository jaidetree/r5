import { fromEvent, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const ARG_PATTERN = /(\/:[_a-zA-Z0-9]+)/g;

// createRouter :: { a } -> { route$: Observable, navigate: (String, { b }) -> void, unsubscribe: () -> void }
export function createRouter (config) {
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
    navigate (url, opts) {
      window.history.pushState(opts.data || null, opts.title || null, url);
      return route$.next(url);
    },
    unsubscribe () {
      popstate$$.unsubscribe();
      return route$.unsubscribe();
    },
  };
}

// parseRoutes :: { string: (...*) -> React.Node } -> Route => { pattern: RegExp, args: [ String ], handler: (...*) -> React.Node }
// Parse a map of routes into an array of objects containing the parsed regex
// & args array
export function parseRoutes (routes) {
  return routes
    |> R.toPairs
    |> R.map(([ patternStr, handler ]) => ({
      pattern: parsePattern(patternStr),
      args: parseArgs(patternStr),
      handler,
    }));
}

// isRoute :: (String, Route) -> Boolean
// Determine if a route object matches a given url.
export function isRoute (url, route) {
  return route.pattern.test(url);
}

// route :: { string: (...*) -> React.Node } -> String -> [ React.Node ]
// Return a map function to match a uri with a view
export function route (routes) {
  return url => parseRoutes(routes)
    |> R.filter(route => isRoute(url, route))
    // we only care about the first match in so far
    |> R.slice(0, 1)
    |> R.map(route => route.handler(getArgsFromURL(url, route)));
}


// getURL :: () -> { path: String, query: string }
// Return a plain javascript object with path and query data.
function getURL () {
  return {
    path: window.location.pathname,
    query: window.location.search,
  };
}

// matchAll :: (RegExp, String) -> [ String ]
function matchAll (pattern, str) {
  return [].concat(new RegExp(pattern).exec(str) || []);
}

// getArgsFromURL :: String -> Route
// Return an object with the arguments parsed
function getArgsFromURL (url, route) {
  return matchAll(route.pattern, url)
    |> R.slice(1)
    |> R.reduce((args, value, i) => R.assoc(route.args[i], value, args), {});
}

// parsePattern :: String -> RegExp
// Return a RegExp from a pattern string with :arg_name
function parsePattern (patternStr) {
  return patternStr
    |> R.replace(ARG_PATTERN, '\/([^\/]+)')
    |> (str => new RegExp(str, 'gi'));
}

// parseArgs :: String -> [ String ]
// Return an array of argument names to construct an object with later
function parseArgs (patternStr) {
  return patternStr
    |> R.match(ARG_PATTERN)
    |> R.map(R.slice(2));
}
