import * as React from "react";
import { CardPile } from "../card-pile";
import { PlayerHand } from "../player-hand";
import { styled } from '@linaria/react';
import { PublicGameStateType } from "../../game-logic";

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

export const gameContext = React.createContext<PublicGameStateType>({ phase: 'play', cardsInTrick: [], playedCards: [] });
export type GameActionType = {
  type: 'play',
  playerId: string
}

export function Game() {
  const [ gameState, dispatch ] = React.useReducer((state: PublicGameStateType, action: GameActionType) => {
    if (action.type === 'play') {
      console.log(action.playerId, action);
    }
    return state;
  }, { phase: 'play', cardsInTrick: [], playedCards: [] });
  return (
    <gameContext.Provider value={gameState}>
      <GridWrapper>
        {([ 'south', 'west', 'north', 'east' ] as const).map((playerId) =>
          <HandWrapper gridArea={playerId}>
            <PlayerHand
              hidden={playerId !== 'south'}
              playerId={playerId}
              cards={[ { suit: 'diamonds', value: 'king' }, { suit: 'hearts', value: 'ace' } ]}
              dispatch={dispatch}
            />
          </HandWrapper>
        )}
        <PileWrapper>
          <CardPile cards={gameState.cardsInTrick} numPlayers={4} />
        </PileWrapper>
      </GridWrapper>
    </gameContext.Provider>
  );
}
