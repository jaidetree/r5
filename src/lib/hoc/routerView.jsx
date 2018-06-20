import { compose, pipe, prop } from 'ramda';
import React from 'react';
import { connect } from 'react-redux';
import { branch, lifecycle, renderComponent, } from 'recompose';
import { cleanupView, initView } from 'app/main/use-cases/router';

export default function routerView (name) {
  function selectState (state) {
    return {
      isLoading: state.router.loading.includes(name),
    };
  }

  function selectActions (dispatch) {
    return {
      initView: pipe(initView, dispatch),
      cleanupView: pipe(cleanupView, dispatch)
    };
  }

  return compose(
    connect(selectState, selectActions),
    lifecycle({
      componentWillMount () {
        this.props.initView(name);
      },

      componentWillUnmount () {
        this.props.cleanupView(name);
      }
    }),
    branch(
      prop('isLoading'),
      renderComponent(props => <span>Loading&hellip;</span>)
    ),
  );
}
