import * as React from "react";
import { PlayerHand } from "./player-hand";

export default function IApp() {
  const [ hidden, setHidden ] = React.useState(false);
  return (
    <>
      <button onClick={() => setHidden((h) => !h)}>{'Flip'}</button>
      <PlayerHand hidden={hidden} cards={[ { suit: 'hearts', value: 'king' }, { suit: 'hearts', value: 'ace' } ]} />
    </>
  );
}
