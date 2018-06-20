import { connect } from 'react-redux';
import { compose, pipe } from 'ramda';
import Router from 'app/main/views/Router';
import { navigate } from 'app/main/use-cases/router';

export default compose(
  connect(selectState, selectActions)
)(Router);

function selectState (state) {
  return {
    views: state.router.views,
  };
}

function selectActions (dispatch) {
  return {
    navigate: pipe(navigate, dispatch),
  };
}
