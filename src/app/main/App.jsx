import React from 'react';
import { Provider } from 'react-redux';

import { createRouter } from 'lib/router';
import { RouterContext } from 'app/main/context';
import createStore from 'app/main/store/index';

import { reducer, epic } from './use-cases';

// @debug
import { ignoreElements } from 'rxjs/operators';
import { INITIALIZE, initialize } from './store/initialize';
import Todos from 'app/todos/containers/Todos';

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
    this.state.store.dispatch(initialize());
  }

  render () {
    return (
      <RouterContext.Provider value={this.state.router}>
        <Provider store={this.state.store}>
          <div className="page">
            <Todos />
          </div>
        </Provider>
      </RouterContext.Provider>
    )
  }
}
