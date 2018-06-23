import { compose, equals } from "ramda"
import { branch, lifecycle, renderComponent, } from "recompose"

import React from "react"

export function Route (props) {
  const Component = props.component

  return <Component />
}

Route.displayName = "Route"

export default compose(
  lifecycle({
    state: {
      isInitialized: false,
    },

    componentDidMount () {
      this.props.initView(this.props.route)
    },

    componentDidUpdate (prevProps) {
      const nextProps = this.props

      if (!equals(prevProps.view, nextProps.view)) {
        this.props.initView(nextProps.route)
      }

      // mark this component as initialized if is done loading
      if (!this.state.isInitialized && !nextProps.isLoading) {
        this.setState({ isInitialized: true })
      }
    },

    componentWillUnmount () {
      this.setState({ isInitialized: false })
      this.props.cleanupView(this.props.route)
    }
  }),
  branch(
    props => props.isLoading || !props.isInitialized,
    renderComponent(() => <span>Loading&hellip;</span>)
  ),
)(Route)
