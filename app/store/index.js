import { applyMiddleware, createStore as createReduxStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import thunkMiddleware from 'redux-thunk';
import * as request from '../lib/request';

export default function createStore (rootReducer, rootEpic, config) {
  return createReduxStore(reducer, {}, applyMiddleware(
    thunkMiddleware,
    createEpicMiddleware(rootEpic, { request }),
  ));
}
