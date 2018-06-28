import React from "react"
import styled from "styled-components"

import Todo from "./Todo"
import classNames from "../todos.scss"

const Wrapper = styled.section`
  width: 37.5rem;
  margin: 0 auto;
  font-family: 'Avenir Next', 'Helvetica Neue', Arial, sans-serif;
`

const TodoList = styled.ul`
  list-style: none;
`

export default function Todos (props) {
  return (
    <Wrapper className={classNames.todos}>
      <TodoList className="todos__list">
        {props.todos.map(todo => (
          <Todo
            key={todo.id}
            onChangeCompleted={props.onChangeCompleted}
            onClickRemove={props.onClickRemove}
            todo={todo}
          />
        ))}
      </TodoList>
      <button className={classNames.add}>
        Add
      </button>
    </Wrapper>
  )
}

Todos.displayName = "Todos"
