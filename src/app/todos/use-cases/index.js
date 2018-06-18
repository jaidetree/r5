import { combineEpics, combineReducers } from 'lib/useCase';
import * as collection from './collection';

export const reducer = combineReducers({
  collection: collection.reducer,
});

export const epic = combineEpics(
  collection.epic,
);
