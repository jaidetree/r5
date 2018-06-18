import { combineReducers, combineEpics } from 'lib/useCase';
import * as todos from 'app/todos/use-cases';

export const reducer = combineReducers({
  todos: todos.reducer,
});

export const epic = combineEpics(
  todos.epic,
);
