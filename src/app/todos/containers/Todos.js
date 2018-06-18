import { compose } from 'ramda';
import { connect } from 'react-redux';
import { withHandlers } from 'recompose';

import Todos from 'app/todos/components/Todos';
import { removeTask } from 'app/todos/use-cases/collection';

export default Todos
  |> withHandlers({
    onClickRemove: props => e => {
      e.preventDefault();
      props.removeTask(e.target.value)
    }
  })
  |> connect(selectState, selectActions);

function selectState (state) {
  return {
    todos: state.todos.collection,
  };
}

function selectActions (dispatch) {
  return {
    removeTask: id => dispatch(removeTask(id)),
  }
}
