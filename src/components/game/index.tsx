import * as React from "react";
import { CardPile } from "../card-pile";
import { PlayerHand } from "../player-hand";
import { styled } from '@linaria/react';
import { keyBy, mapKeys, mapValues } from 'lodash';
const SocketIO: SocketIOClientStatic = require('socket.io-client');
const ENDPOINT = "ws://localhost:5000";

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
const DealButton = styled.button`
  background-color: #acacac;
  border-radius: 1em;
  font-size: 4em;
`;

export type CardType = {
  suit: 'clubs' | 'hearts' | 'spades' | 'diamonds'
  value: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'jack' | 'queen' | 'king' | 'ace'
}

type GameStateType = {
  hands: {
    north: CardType[]
    south: CardType[]
    east: CardType[]
    west: CardType[]
  }
  phase: 'play' | 'bid'
  cardsInTrick: CardType[]
}

export function Game() {
  const [ gameState, setGameState ] = React.useState<GameStateType>({
    phase: 'bid',
    cardsInTrick: [],
    hands: {
      north: [],
      south: [],
      east: [],
      west: []
    }
  });
  const [ ack, setAck ] = React.useState<{ for: 'bid' | 'play', func: Function } | null>(null);
  React.useEffect(() => {
    const socket = SocketIO(ENDPOINT);
    socket.on('connect', () => {
      socket.emit('new_game', {
        players: [ 'bot_west', 'bot_north', 'bot_east', 'south' ],
        max_hand: 3
      });
    });
    socket.on('game_init', (update: any) => {
      if ('success' in update) {
        socket.emit('deal');
      }
    });
    socket.on('hands', (data: { [playerId: string]: string[] }) => setGameState((old) => {
      const hands = Object.entries(data).reduce((acc, [ key, hand ]) => {
        const newKey = key.startsWith('bot_') ? key.slice(4) : key;
        const newHand = hand.map((card) => {
          const [ value, suit ] = card.toLowerCase().split(' of ');
          return { suit, value };
        });
        return { ...acc, [newKey]: newHand };
      }, { north: [], south: [], east: [], west: []});
      return { ...old, hands };
    }));
    socket.on('bid_request', (data: any, thisAck: Function) => {
      setAck({ for: 'bid', func: (val: any) => { thisAck(val); setAck(null) } });
    });
    socket.on('card_request', (data: any, thisAck: Function) => {
      setAck({ for: 'play', func: (val: any) => { thisAck(val); setAck(null) } });
    });
    socket.on('play', console.log);
    socket.on('trump', console.log);
    socket.on('bids', console.log);
    socket.on('lead_suit', console.log);
    socket.on('winner', console.log);
    socket.on('round_end', () => console.log('round end'));
  }, []);
  if (ack?.for === 'bid') {
    let bid = '';
    while (!parseInt(bid)) {
      bid = prompt('Place a bid') ?? '';
    }
    ack.func(parseInt(bid));
  }
  if (ack?.for === 'play') {
    let bid = null;
    while (!bid) {
      bid = prompt('Play a card') ?? '';
    }
    ack.func(bid);
  }
  return (
    <GridWrapper>
      {Object.entries(gameState.hands).map(([ playerId, hand ]) =>
        <HandWrapper key={playerId} gridArea={playerId as keyof GameStateType['hands']}>
          <PlayerHand
            hidden={playerId !== 'south'}
            playerId={playerId}
            cards={hand}
            onPlay={ack?.for === 'play' ? ack.func : undefined}
          />
        </HandWrapper>
      )}
      <PileWrapper>
        <CardPile cards={gameState.cardsInTrick} numPlayers={4} />
      </PileWrapper>
      <DealButton>{'Deal'}</DealButton>
    </GridWrapper>
  );
}
