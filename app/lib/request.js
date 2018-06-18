import { ajax } from 'rxjs/ajax';

export function GET (url, headers={}) {
  return ajax.getJSON(url, headers);
}

export function PATCH (url, data, headers={}) {
  return ajax.PATCH(url, data, headers);
}

export function POST (url, data, headers={}) {
  return ajax.POST(url, data, headers);
}

export function PUT (url, data, headers={}) {
  return ajax.POST(url, data, headers);
}
