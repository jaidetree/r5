import React from "react"
import ReactDOM from "react-dom"

import log from "lib/log"
window.log = log

import App from "app/main/App"

window.R5 = {
  DEBUG: process.env.NODE_ENV === "development",
}

ReactDOM.render(<App />, document.getElementById("app"))
