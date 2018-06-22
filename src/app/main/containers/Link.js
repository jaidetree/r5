import { compose } from "ramda"
import { connect } from "react-redux"
import { withHandlers } from "recompose"
import { navigate } from "app/main/use-cases/routing"
import Link from "app/main/components/Link"

export default compose(
  connect(null, { navigate }),
  withHandlers({
    onClickLink: props => e => {
      e.preventDefault()
      props.navigate(props.href)
    },
  })
)(Link)
