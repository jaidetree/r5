import React from "react"
import styled from "styled-components"
import deleteIcon from "../assets/delete.svg"

const Task = styled.li`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  margin-bottom: 0.625rem;
  justify-content: stretch;
  padding: 0.625rem;
  border-bottom: 1px solid #e5e5e5;
`

const TaskDescription = styled.label`
  flex: 1 1 auto;
  margin: 0 0.625rem;
  font-size: 1.25rem;
  color: ${props => props.completed ? "#ccc" : "inherit"};
  font-style: ${props => props.completed ? "italic" : "normal"};
  text-decoration: ${props => props.completed ? "line-through": "none"};
`

const Remove = styled.button`
  border: none;
  background: url(${deleteIcon}) no-repeat 50% 50%;
  cursor: pointer;
  outline: none;
  line-height: 2.25;
  width: 24px;
  height: 24px;
  text-indent: -999px;
  overflow: hidden;
`

export default function Todo (props) {
  const id = `task-checkbox-${props.todo.id}`

  return (
    <Task
      className="todo"
    >
      <span className="todo__checkbox">
        <input
          checked={props.todo.completed}
          id={id}
          name="is_completed"
          onChange={props.onChangeCompleted}
          type="checkbox"
          value={props.todo.id}
        />
      </span>
      <TaskDescription className="todo__task" htmlFor={id} completed={props.todo.completed}>
        {props.todo.task}
      </TaskDescription>
      <Remove type="button" onClick={props.onClickRemove} value={props.todo.id}>Delete</Remove>
    </Task>
  )
}

Todo.displayName = "Todo"
