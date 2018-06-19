import { combineReducers, combineEpics } from 'lib/useCase';
import * as todos from 'app/todos/use-cases';
import * as router from './router';

export const reducer = combineReducers({
  router: router.reducer,
  todos: todos.reducer,
});

export const epic = combineEpics(
  router.epic,
  todos.epic,
);
