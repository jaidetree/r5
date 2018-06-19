import * as Rx from 'rxjs/Rx';
import * as Router from 'lib/router';
import { expectA, expectEqual } from './lib/util';

function createConfig (props) {
  return {
    window: window,
    location: {
      pathname: '/',
      search: '',
    },
    history: {
      pushState: jest.fn(),
    },
    ...props,
  };
}

describe('router', () => {
  describe('.createRouter', () => {
    test('returns an object', () => {
      const router = Router.createRouter(createConfig());

      expectEqual(Object.keys(router), [
        'route$',
        'navigate',
        'unsubscribe'
      ]);

      expectA(router.route$, Rx.Observable);
      expectA(router.navigate, Function);
      expectA(router.unsubscribe, Function);
    })

    test('reacts to popstate events', () => {
      let config = createConfig();
      const router = Router.createRouter(config);
      const popstateEvent = new window.Event("popstate", { bubbles: true });

      const promise = router.route$
        .skip(1)
        .take(1)
        .toPromise()

      config.location.pathname = '/test-path/';
      document.dispatchEvent(popstateEvent);

      return promise
        .then(expectEqual({
          path: '/test-path/',
          query: {},
        }));
    });

    test('reacts to navigate calls', () => {
      let config = createConfig();
      const router = Router.createRouter(config);

      const promise = router.route$
        .skip(1)
        .take(1)
        .toPromise()

      router.navigate('/test-path/?id=1');

      return promise
        .then(expectEqual({
          path: '/test-path/',
          query: { id: 1 },
        }));
    });

    test('unsubscribe cleans up stream resources', () => {
      let config = createConfig();
      const router = Router.createRouter(config);

      const promise = router.route$
        .toArray()
        .toPromise()

      router.unsubscribe();

      return promise
        .then(expectEqual([
          {
            path: '/',
            query: {},
          }
        ]));
    });
  });

  describe('.parseRoutes', () => {
    test('routes should be a list of routing objects', () => {
      const routes = {
        '/tests/article/:id/': 'view_article',
        '/tests/article/:id/:slug/': 'view_article',
      };

      expectEqual(Router.parseRoutes(routes), [
        {
          pattern: /\/tests\/article\/([^\/]+)\//gi,
          args: ['id'],
          name: 'view_article',
        },
        {
          pattern: /\/tests\/article\/([^\/]+)\/([^\/]+)\//gi,
          args: ['id', 'slug'],
          name: 'view_article',
        }
      ]);
    });
  });

  describe('.isRoute', () => {
    test('returns true when uri matches pattern', () => {
      const route = {
        pattern: /\/tests\/article\/([^\/]+)\/([^\/]+)/gi,
        args: ['id', 'slug'],
        name: 'view_article',
      };
      const location = {
        path: '/tests/article/25/abc-def',
        query: {},
      };

      expectEqual(Router.isRoute(location, route), true);
    });

    test('returns false when uri does not match pattern', () => {
      const route = {
        pattern: /\/tests\/article\/([^\/]+)\/([^\/]+)/gi,
        args: ['id', 'slug'],
        name: 'view_article',
      };
      const location = {
        path: '/tests/not-article/25/abc-def',
        query: {},
      };

      expectEqual(Router.isRoute(location, route), false);
    });
  });

  describe('.parseQueryString', () => {
    test('returns an object', () => {
      const qs = '?id=1&is_true=true&is_false=false&list=[1,2,3]&data={"a":1,"b":2,"c":3}';

      expectEqual(Router.parseQueryString(qs), {
        id: 1,
        is_true: true,
        is_false: false,
        list: [1, 2, 3],
        data: { a: 1, b: 2, c: 3 },
      });
    });
  });

  describe('.getArgsFromURL', () => {
    test('should return an object with named arg values', () => {
      const route = {
        pattern: /\/tests\/article\/([^\/]+)\/([^\/]+)/gi,
        args: ['id', 'slug'],
        name: 'view_article',
      };
      const uri = '/tests/article/25/abc-def';

      expectEqual(Router.getArgsFromURL(uri, route), {
        id: 25,
        slug: 'abc-def',
      });
    });
  });
});
