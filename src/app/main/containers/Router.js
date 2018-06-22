import { connect } from "react-redux"
import { compose, pipe } from "ramda"
import { navigate } from "app/main/use-cases/routing"

import Router from "app/main/components/Router"

export default compose(
  connect(selectState, selectActions)
)(Router)

function selectState (state) {
  return {
    views: state.routing.views,
  }
}

function selectActions (dispatch) {
  return {
    navigate: pipe(navigate, dispatch),
  }
}
