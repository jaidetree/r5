import React from 'react';
import { Provider } from 'react-redux';

import { createRouter } from '../lib/router';
import RouterContext from '../store/router-context';
import createStore from '../store/index';

import { reducer, epic } from '../use-cases';

// @debug
import { ignoreElements } from 'rxjs/operators';
import { INITIALIZE } from '../store/actions';

export default class App extends React.Component {
  static displayName = 'App';

  state = {
    router: createRouter({}),
    store: createStore(reducer, epic, {})
  };

  componentWillMount () {
    window.store = this.state.store;
  }

  componentWillUnmount () {
    this.setState({ router: {}, store: {} });
  }

  componentDidMount () {
    this.state.store.dispatch({ type: INITIALIZE, data: {} });
  }

  render () {
    return (
      <RouterContext.Provider value={this.state.router}>
        <Provider store={this.state.store}>
          <div>
            Hello World
          </div>
        </Provider>
      </RouterContext.Provider>
    )
  }
}
