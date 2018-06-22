import React from "react"

export default function Route (props) {
  const Component = props.component

  return <Component />
}

Route.displayName = "Route"
