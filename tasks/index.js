import { prop, unary } from 'ramda';
import { argv } from 'yargs';
import Stream from 'highland';


// Get the gulp tasks from argv._ and require them
// this way we are only loading the task files as needed

argv
  |> Stream.of
  |> Stream.flatMap(prop('_'))
  |> Stream.map(taskName => `./${taskName}/${taskName}.task.js`)
  |> Stream.each(unary(require));
