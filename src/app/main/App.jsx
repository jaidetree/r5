import React from "react"
import { Provider } from "react-redux"

import { createRouter } from "lib/router"
import { RouterContext } from "app/main/context"
import createStore from "app/main/store/index"

import { reducer, epic } from "./use-cases"

// @debug
import { ignoreElements } from "rxjs/operators"
import { initialize } from "./store/initialize"
import * as request from "lib/request"

import Router from "./containers/Router"
import Todos from "app/todos/containers/Todos"
import routes from "app/routes"
import { startRouting } from "app/main/use-cases/router"

export default class App extends React.Component {
  static displayName = "App";
  static routes = routes;

  state = {
    router: createRouter({}),
    store: {}
  };

  componentWillMount () {
    const store = createStore(reducer, epic, {}, {
      dependencies: {
        router: this.state.router,
        request,
        window,
      },
    })

    this.setState({ store })
    window.store = store
  }

  componentWillUnmount () {
    this.setState({ router: {}, store: {} })
  }

  componentDidMount () {
    this.state.store.dispatch(startRouting(App.routes))
    this.state.store.dispatch(initialize())
  }

  render () {
    return (
      <RouterContext.Provider value={this.state.router}>
        <Provider store={this.state.store}>
          <Router
            routes={App.routes}
          />
          {/*
          <div className="page">
            <Todos />
          </div>
          */}
        </Provider>
      </RouterContext.Provider>
    )
  }
}
