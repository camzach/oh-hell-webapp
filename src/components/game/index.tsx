import * as React from "react";
import { CardPile } from "../card-pile";
import { PlayerHand } from "../player-hand";
import { styled } from '@linaria/react';

const GridWrapper = styled.div`
  display: grid;
  grid-template: 20em auto 20em / 20em auto 20em;
  grid-template-areas: ".    north ."
                     "east pile  west"
                     ".    south .";
  height: 100%;
  width: 100%;
`;
const HandWrapper = styled.div<{ gridArea: 'north' | 'south' | 'east' | 'west' }>`
  grid-area: ${(props) => props.gridArea};
  margin: auto;
`;
const PileWrapper = styled.div`
  grid-area: pile;
  margin: auto;
`;

export function Game() {
  const [ hidden, setHidden ] = React.useState(false);
  return (
    <GridWrapper>
      <HandWrapper gridArea="north">
        <PlayerHand hidden={hidden} cards={[ { suit: 'diamonds', value: 'king' }, { suit: 'hearts', value: 'ace' } ]} />
      </HandWrapper>
      <HandWrapper gridArea="east">
        <PlayerHand hidden={hidden} cards={[ { suit: 'clubs', value: 'king' }, { suit: 'hearts', value: 'ace' } ]} />
      </HandWrapper>
      <PileWrapper>
        <CardPile cards={[{ suit: 'clubs', value: 'ace'}, {suit: 'hearts', value: 4}, {suit: 'diamonds', value: 10}]} numPlayers={4} />
      </PileWrapper>
      <HandWrapper gridArea="west">
        <PlayerHand hidden={hidden} cards={[ { suit: 'clubs', value: 'king' }, { suit: 'hearts', value: 'ace' } ]} />
      </HandWrapper>
      <HandWrapper gridArea="south">
        <PlayerHand hidden={hidden} cards={[ { suit: 'clubs', value: 'king' }, { suit: 'hearts', value: 'ace' } ]} />
      </HandWrapper>
    </GridWrapper>
  );
}
