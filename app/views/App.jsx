import React from 'react';
import { createRouter } from '../lib/router';
import RouterContext from '../store/router-context';

export default class App extends React.Component {
  static displayName = 'App';

  state = {
    router: createRouter({}),
  };

  componentWillUnmount () {
    this.setState({ router: {} });
  }

  render () {
    return (
      <RouterContext.Provider value={this.state.router}>
        <div>
          Hello World
        </div>
      </RouterContext.Provider>
    )
  }
}
