import { compose, equals, prop } from "ramda"
import { branch, lifecycle, renderComponent, } from "recompose"

import React from "react"

export function Route (props) {
  const Component = props.component

  return <Component />
}

Route.displayName = "Route"

export default compose(
  lifecycle({
    componentDidMount () {
      this.props.initView(this.props.route)
    },

    componentDidUpdate (prev) {
      const next = this.props
      if (!equals(prev.view, next.view)) {
        this.props.initView(next.route)
      }
    },

    componentWillUnmount () {
      this.props.cleanupView(this.props.route)
    }
  }),
  branch(
    prop("isLoading"),
    renderComponent(() => <span>Loading&hellip;</span>)
  ),
)(Route)
