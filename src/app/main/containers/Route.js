import { compose, pipe } from "ramda"
import { connect } from "react-redux"
import { cleanupView, initView } from "app/main/use-cases/routing"
import Route from "app/main/components/Route"

export default compose(
  connect(selectState, selectActions),
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
