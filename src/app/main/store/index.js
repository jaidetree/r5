import { compose, identity } from 'ramda';
import { applyMiddleware, createStore as createReduxStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import thunkMiddleware from 'redux-thunk';

export default function createStore (rootReducer, rootEpic, defaultState, config) {
  const epicMiddleware = createEpicMiddleware({ dependencies: config.dependencies });

  const store = createReduxStore(rootReducer, defaultState, compose(
    applyMiddleware(
      thunkMiddleware,
      epicMiddleware,
    ),
    window.R5.DEBUG && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() || identity,
  ));

  epicMiddleware.run(rootEpic);

  return store;
}
