import React from "react"
import { wrapDisplayName } from "recompose"

export default function getContext (propName, Context) {
  return function getContextWrapper (Component) {
    function GetContext (props) {
      return (
        <Context.Consumer>
          {value => <Component {...props} {...{ [propName]: value }} />}
        </Context.Consumer>
      )
    }

    GetContext.displayName = wrapDisplayName(Component, "GetContext")

    return GetContext
  }
}
