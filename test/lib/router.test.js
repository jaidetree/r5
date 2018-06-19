import * as router from 'lib/router';

describe('router', () => {
  describe('.parseQueryString', () => {
    test('returns an object', () => {
      expect(router.parseQueryString('?id=1,is_true=true,is_false=false,list=[1,2,3]')).toEqual({
        id: 1,
        is_true: true,
        is_false: false,
        list: [1, 2, 3]
      });
    });
  });
});
