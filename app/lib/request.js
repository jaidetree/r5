import { curry, mergeDeepRight as merge } from 'ramda';
import { ajax } from 'rxjs/ajax';

export const GET = curry(function GET (url, data, headers={}) {
  return ajax.getJSON(url, merge(headers, {
    'content-type': 'application/json',
  }));
});

export const PATCH = curry(function PATCH (url, data, headers={}) {
  return ajax.PATCH(url, data, headers);
});

export const POST = curry(function POST (url, data, headers={}) {
  return ajax.POST(url, data, headers);
});

export const PUT = curry(function PUT (url, data, headers={}) {
  return ajax.POST(url, data, headers);
});
