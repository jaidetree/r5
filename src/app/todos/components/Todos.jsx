import React from 'react';

import Todo from './Todo';

export default function Todos (props) {
  return (
    <div className="todos">
      <ul className="todos__list">
        {props.todos.map(todo => (
          <Todo todo={todo} key={todo.id} onClickRemove={props.onClickRemove} />
        ))}
      </ul>
    </div>
  );
}

Todos.displayName = 'Todos';
