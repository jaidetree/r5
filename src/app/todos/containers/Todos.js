import { connect } from "react-redux"
import { withHandlers } from "recompose"

import Todos from "app/todos/components/Todos"
import { removeTask, updateTask } from "app/todos/use-cases/todos"

export default Todos
  |> withHandlers({
    onClickRemove,
    onChangeCompleted,
  })
  |> connect(selectState, {
    removeTask,
    updateTask,
  });

function selectState (state) {
  return {
    todos: state.todos.todos,
  }
}

function onClickRemove (props) {
  return e => {
    e.preventDefault()
    if (window.confirm("Are you sure you want to delete this task?")) {
      props.removeTask(e.target.value)
    }
  }
}

function onChangeCompleted (props) {
  return e => {
    props.updateTask({
      id: Number(e.target.value),
      completed: e.target.checked,
    })
  }
}
