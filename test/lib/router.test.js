import { Observable } from 'rxjs';
import * as Router from 'lib/router';

describe('router', () => {
  describe('.createRouter', () => {
    test('returns an object', () => {
      const router = Router.createRouter({})

      expect(Object.keys(router))
        .toEqual([
          'route$',
          'navigate',
          'unsubscribe'
        ]);
      expect(router.route$).toBeInstanceOf(Observable)
      expect(router.navigate).toBeInstanceOf(Function);
      expect(router.unsubscribe).toBeInstanceOf(Function);
    })
  });

  describe('.parseQueryString', () => {
    test('returns an object', () => {
      expect(Router.parseQueryString('?id=1&is_true=true&is_false=false&list=[1,2,3]')).toEqual({
        id: 1,
        is_true: true,
        is_false: false,
        list: [1, 2, 3]
      });
    });
  });
});
