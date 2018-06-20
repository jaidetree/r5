import React from "react"
import { propEq } from "ramda"

export default function Router (props) {
  return (
    <div>
      {props.routes
        .filter(route => props.views.some(propEq("name", route.name)))
        .map(({ name, Component }) => <Component key={name} />)
      }
      <pre>
        {JSON.stringify(props.views, null, 2)}
      </pre>
    </div>
  )
}

Router.displayName = "Router"
