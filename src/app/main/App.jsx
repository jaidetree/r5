import React from "react"
import { Provider } from "react-redux"

// Shared Libs
import * as request from "lib/request"

// Views
import Route from "./containers/Route"
import Router from "./containers/Router"
import TodosApp from "app/todos/TodosApp"

// App
import { createRouter } from "app/main/lib/router"
import createStore from "app/main/store/index"
import routes from "app/routes"
import { RouterContext } from "app/main/context"
import { initialize } from "./store/initialize"
import { reducer, epic } from "./use-cases"

export default class App extends React.Component {
  static displayName = "App";
  static routes = routes;

  state = {};

  constructor (props) {
    super(props)
    this.state.router$ = createRouter({})
    this.state.store = createStore(reducer, epic, {}, {
      dependencies: {
        router$: this.state.router$,
        request,
        window,
      },
    })
    window.store = this.state.store
  }

  componentWillUnmount () {
    this.setState({ router: {}, store: {} })
  }

  componentDidMount () {
    this.state.store.dispatch(initialize({
      routes: App.routes,
    }))
  }

  render () {
    return (
      <RouterContext.Provider value={this.state.router$}>
        <Provider store={this.state.store}>
          <Router>
            <Route route="todos" component={TodosApp} />
          </Router>
        </Provider>
      </RouterContext.Provider>
    )
  }
}
