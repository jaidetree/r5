import { toPairs, propEq } from 'ramda';
import React from 'react';

export default function Router (props) {
  return (
    <div>
      {toPairs(props.routes)
        .filter(([ name ]) => props.views.some(propEq('name', name)))
        .map(([ name, Component ]) => <Component key={name} />)
      }
      <pre>
        {JSON.stringify(props.views, null, 2)}
      </pre>
    </div>
  )
}

Router.displayName = 'Router';
