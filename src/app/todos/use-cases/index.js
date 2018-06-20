import { combineEpics, combineReducers } from 'lib/useCase';
import { routeEpic } from 'app/main/use-cases/router';
import * as collection from './collection';

export const reducer = combineReducers({
  collection: collection.reducer,
});

export const epic = routeEpic('todos', combineEpics(
  collection.epic,
));
