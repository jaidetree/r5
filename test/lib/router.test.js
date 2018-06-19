import * as Rx from 'rxjs/Rx';
import * as Router from 'lib/router';

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

      expect(Object.keys(router))
        .toEqual([
          'route$',
          'navigate',
          'unsubscribe'
        ]);
      expect(router.route$).toBeInstanceOf(Rx.Observable)
      expect(router.navigate).toBeInstanceOf(Function);
      expect(router.unsubscribe).toBeInstanceOf(Function);
    })

    test('reacts to popstate events', () => {
      let config = createConfig();
      const router = Router.createRouter(config);
      const popstateEvent = new window.Event("popstate", { bubbles: true });

      const promise = router.route$
        .skip(1)
        .take(1)
        .toPromise()
        .then(uri => {
          expect(uri).toEqual({
            path: '/test-path/',
            query: {},
          });
        });

      config.location.pathname = '/test-path/';
      document.dispatchEvent(popstateEvent);

      return promise;
    });

    test('reacts to navigate calls', () => {
      let config = createConfig();
      const router = Router.createRouter(config);

      const promise = router.route$
        .skip(1)
        .take(1)
        .toPromise()
        .then(uri => {
          expect(uri).toEqual({
            path: '/test-path/',
            query: { id: 1 },
          });
        });

      router.navigate('/test-path/?id=1');

      return promise;
    });
  });

  describe('.parseQueryString', () => {
    test('returns an object', () => {
      const qs = "?id=1&is_true=true&is_false=false&list=[1,2,3]";

      expect(Router.parseQueryString(qs)).toEqual({
        id: 1,
        is_true: true,
        is_false: false,
        list: [1, 2, 3]
      });
    });
  });
});
