import { prop, replace, unary } from "ramda"
import { argv } from "yargs"
import path from "path"
import Stream from "highland"

function formatTaskFile (taskName) {
  const fileName = replace(/:/g, "/", taskName)

  return `./${fileName}/${path.basename(fileName)}.task.js`
}


// Get the gulp tasks from argv._ and require them
// this way we are only loading the task files as needed

argv
  |> Stream.of
  |> Stream.flatMap(prop("_"))
  |> Stream.map(formatTaskFile)
  |> Stream.each(unary(require))
