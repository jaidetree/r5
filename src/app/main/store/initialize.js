export const INITIALIZE = "app/initialize"

export function initialize (data={}) {
  return { type: INITIALIZE, data }
}
