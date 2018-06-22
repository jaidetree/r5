import { compose, equals, pipe, prop } from "ramda"
import React from "react"
import { connect } from "react-redux"
import { branch, lifecycle, renderComponent, } from "recompose"
import { cleanupView, initView } from "app/main/use-cases/routing"
import Route from "app/main/components/Route"

export default compose(
  connect(selectState, selectActions),
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

function selectState (state, ownProps) {
  return {
    isLoading: state.routing.loading.includes(ownProps.route),
  }
}

function selectActions (dispatch) {
  return {
    initView: pipe(initView, dispatch),
    cleanupView: pipe(cleanupView, dispatch)
  }
}
