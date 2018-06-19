import * as R from 'ramda';
import { argv } from 'yargs';
import HStream from 'highland';


// Get the gulp tasks from argv._ and require them
// this way we are only loading the task files as needed

argv
  |> R.prop('_')
  |> HStream
  |> HStream.map(taskName => `./${taskName}/${taskName}.task.js`)
  |> HStream.each(R.unary(require));
