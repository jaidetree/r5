import React from "react"
import { propEq, prop } from "ramda"

export default function Router (props) {
  return (
    <div>
      {React.Children.toArray(props.children)
        .map(child => ({
          component: child,
          view: props.views.find(propEq("name", child.props.route))
        }))
        .filter(prop("view"))
        .map(({ component, view }) => React.cloneElement(component, {
          view,
        }))
      }
      <pre>
        {JSON.stringify(props.views, null, 2)}
      </pre>
    </div>
  )
}

Router.displayName = "Router"
