import React from 'react';
import styled from 'styled-components';

import Todo from './Todo';

const Wrapper = styled.section`
  width: 37.5rem;
  margin: 0 auto;
  font-family: 'Avenir Next', 'Helvetica Neue', Arial, sans-serif;
`;

const TodoList = styled.ul`
  list-style: none;
`;

const Title = styled.h1`
  font-size: 2rem;
  text-align: center;
`;

export default function Todos (props) {
  return (
    <Wrapper className="todos">
      <TodoList className="todos__list">
        <Title>
          R5 Todos App
        </Title>
        {props.todos.map(todo => (
          <Todo
            key={todo.id}
            onChangeCompleted={props.onChangeCompleted}
            onClickRemove={props.onClickRemove}
            todo={todo}
          />
        ))}
      </TodoList>
    </Wrapper>
  );
}

Todos.displayName = 'Todos';
