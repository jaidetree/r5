import * as request from "lib/request"

export function fetch () {
  return request.GET("/data/todos.json")
}
