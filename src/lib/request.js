import { curry, mergeDeepRight as merge } from "ramda"
import { ajax } from "rxjs/ajax"
import { tap } from "rxjs/operators"

export const GET = curry(function GET (url, headers={}) {
  return ajax.getJSON(url, headers)
})

export const PATCH = curry(function PATCH (url, data, headers={}) {
  return ajax.PATCH(url, data, headers)
})

export const POST = curry(function POST (url, data, headers={}) {
  return ajax.POST(url, data, headers)
})

export const PUT = curry(function PUT (url, data, headers={}) {
  return ajax.POST(url, data, headers)
})
