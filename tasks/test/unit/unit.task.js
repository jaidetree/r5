import * as R from "ramda"
import PluginError from "plugin-error"
import Stream from "highland"
import gulp from "gulp"
import jest from "jest-cli"
import jestConfig from "../config/jest.config.js"

gulp.task("test:unit", () => jest
  .runCLI(jestConfig, [ jestConfig.rootDir ])
  |> Stream
  |> Stream.pluck("results")
  |> Stream.filter(R.either(
    R.prop("numFailedTests"),
    R.prop("numFailedTestSuites"),
  ))
  |> Stream.flatMap(R.pipe(
    () => new PluginError("test:unit", "Tests failed"),
    Stream.fromError,
  ))
  |> Stream.toNodeStream({ objectMode: true })
)
