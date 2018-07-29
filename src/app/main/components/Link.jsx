import { compose } from "ramda"
import React from "react"
import { RouterContext } from "app/main/context"
import { withHandlers } from "recompose"
import getContext from "lib/hoc/getContext"

export function Link (props) {
  return (
    <a href={props.href} onClick={props.onClickLink}>{props.children}</a>
  )
}

Link.displayName = "Link"

export default compose(
  getContext("router", RouterContext),
  withHandlers({
    onClickLink: props => e => {
      e.preventDefault()
      debugger;
      props.router.navigate(props.href)
    },
  })
)(Link)
