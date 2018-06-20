import React from "react"
import ReactDOM from "react-dom"

import App from "app/main/App"
import log from "lib/log"

window.log = log
window.R5 = {
  DEBUG: process.env.NODE_ENV === "development",
}

ReactDOM.render(<App />, document.getElementById("app"))
