import React from 'react';

export default function Todo (props) {
  return (
    <li
      className="todo"
      >
      <span className="todo__checkbox">
        <input type="checkbox" name="is_completed" checked={props.todo.completed} />
      </span>
      <p className="todo__task">
        {props.todo.task}
      </p>
      <button type="button" onClick={props.onClickRemove} value={props.todo.id}>Delete</button>
    </li>
  );
}

Todo.displayName = "Todo";
