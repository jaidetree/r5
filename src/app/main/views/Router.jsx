import { toPairs, propEq } from 'ramda';
import React from 'react';

export default function Router (props) {
  return (
    <div>
      {props.routes
        .filter(route => props.views.some(propEq('name', route.name)))
        .map(log('matching routes'))
        .map(({ name, Component }) => <Component key={name} />)
      }
      <pre>
        {JSON.stringify(props.views, null, 2)}
      </pre>
    </div>
  )
}

Router.displayName = 'Router';
