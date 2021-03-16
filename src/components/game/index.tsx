import * as React from "react";
import { CardPile } from "../card-pile";
import { PlayerHand } from "../player-hand";
import { styled } from '@linaria/react';
import { cards } from '../card-images';
import { mapKeys, cloneDeep } from "lodash";

const SocketIO: SocketIOClientStatic = require('socket.io-client');
// @ts-ignore SERVER is defined by webpack
const ENDPOINT = SERVER;

const GridWrapper = styled.div`
  display: grid;
  grid-template: 20em auto 20em / 20em auto 20em;
  grid-template-areas: ".    north ."
                     "west pile  east"
                     ".    south .";
  height: 100%;
  width: 100%;
`;
const HandWrapper = styled.div<{ gridArea: 'north' | 'south' | 'east' | 'west' }>`
  grid-area: ${(props) => props.gridArea};
  margin: auto;
  display: flex;
  flex-direction: column;
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
  bids: {
    north: number
    south: number
    east: number
    west: number
  }
  taken: {
    north: number
    south: number
    east: number
    west: number
  }
  scores: {
    north: number
    south: number
    east: number
    west: number
  }
  phase: 'play' | 'bid' | 'pre-deal'
  cardsInTrick: Array<CardType | null>
  trumpCard: CardType | null
}

type AckType = {
  for: 'play',
  func: (card: CardType) => void
} | {
  for: 'bid',
  func: (bid: number) => void
} | {
  for: 'deal',
  func: () => void
} | {
  for: 'trick_end',
  winner: keyof GameStateType['hands']
  func: () => void
}

const players = [ 'south', 'bot_west', 'bot_north', 'bot_east' ];

const clearedState: GameStateType = {
  phase: 'pre-deal',
  cardsInTrick: [ null, null, null, null ],
  trumpCard: null,
  hands: {
    north: [],
    south: [],
    east: [],
    west: []
  },
  bids: {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  },
  taken: {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  },
  scores: {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  }
}

export function Game() {
  const [ gameState, setGameState ] = React.useState<GameStateType>(clearedState);
  const [ ack, setAck ] = React.useState<AckType | null>(null);
  const [ tempBid, setTempBid ] = React.useState(0);
  React.useEffect(() => {
    const socket = SocketIO(ENDPOINT);
    socket.on('connect', () => {
      socket.emit('new_game', {
        players,
        max_hand: 3
      });
    });
    socket.on('game_init', (update: any) => {
      if ('success' in update) {
        setAck({ for: 'deal', func: () => socket.emit('deal') });
      }
    });
    socket.on('deal', console.log);
    socket.on('hands', (data: { [playerId: string]: string[] }) => setGameState((old) => {
      const hands = Object.entries(data).reduce((acc, [ key, hand ]) => {
        const newKey = key.startsWith('bot_') ? key.slice(4) : key;
        const newHand = hand.map((card) => {
          const [ value, suit ] = card.toLowerCase().split(' of ');
          return { suit, value };
        });
        return { ...acc, [newKey]: newHand };
      }, { north: [], south: [], east: [], west: []});
      return { ...old, phase: 'bid', hands };
    }));
    socket.on('bid_request', (bids: Partial<GameStateType['bids']>, thisAck: Function) => {
      setGameState((old) => {
        const newBids = mapKeys(bids, (_, key) => key.startsWith('bot') ? key.slice(4) : key) as GameStateType['bids'];
        return { ...old, bids: { ...old.bids, ...newBids } };
      })
      setAck({ for: 'bid', func: (val) => { thisAck(val); setAck(null) } });
    });
    socket.on('card_request', (data: any, thisAck: Function) => {
      setAck({
        for: 'play',
        func: (val) => {
          setGameState((old) => {
            const played = [ ...old.cardsInTrick ];
            played[0] = val;
            const newHands = cloneDeep(old.hands);
            newHands.south = newHands.south.filter((card) => card.value !== val.value || card.suit !== val.suit);
            console.log(newHands);
            return { ...old, cardsInTrick: played, hands: newHands };
          });
          thisAck(`${val.value} of ${val.suit}`);
          setAck(null)
        }
      });
    });
    socket.on('play', (data: { player: keyof GameStateType['hands'], card: string }) => {
      setGameState((old) => {
        const played = [ ...old.cardsInTrick ];
        const playerIdx = players.indexOf(data.player);
        if (!playerIdx) {
          return old;
        }
        const [ value, suit ] = data.card.toLowerCase().split(' of ');
        played[playerIdx] = { value, suit } as CardType;
        const newHands = cloneDeep(old.hands);
        const playerName = (data.player.startsWith('bot') ? data.player.slice(4) : data.player) as keyof GameStateType['hands'];
        newHands[playerName] = newHands[playerName].filter((card) => card.value !== value || card.suit !== suit);
        console.log(playerName, old.hands, newHands);
        return { ...old, cardsInTrick: played, hands: newHands };
      })
    });
    socket.on('trump', (data: string) => {
      const [ value, suit ] = data.toLowerCase().split(' of ') as [ CardType['value'], CardType['suit']];
      setGameState((old) => ({ ...old, trumpCard: { value, suit } }));
    });
    socket.on('bids', (bids: GameStateType['bids']) => {
      setGameState((old) => {
        const newBids = mapKeys(bids, (_, key) => key.startsWith('bot') ? key.slice(4) : key) as GameStateType['bids'];
        return { ...old, bids: newBids };
      })
    });
    socket.on('lead_suit', console.log);
    socket.on('trick_winner', (winner: keyof GameStateType['taken'], ack: () => void) => {
      setAck({ for: 'trick_end', winner, func: () => {
        ack();
        setGameState((old) => ({
          ...old,
          cardsInTrick: [],
          taken: {
            ...old.taken,
            [winner]: old.taken[winner] + 1
          }
        }));
      }});
    })
    socket.on('round_end', () => {
      setGameState((old) => ({
        ...clearedState,
        scores: old.scores
      }));
      setAck({ for: 'deal', func: () => socket.emit('deal') });
    });
    socket.on('scores', (scores: GameStateType['scores']) => {
      setGameState((old) => ({
        ...old,
        scores: mapKeys(scores, (_, key) => key.startsWith('bot') ? key.slice(4) : key) as GameStateType['scores']
      }));
    });
  }, []);

  return (
    <GridWrapper>
      {Object.entries(gameState.hands).map(([ playerId, hand ]: [keyof GameStateType['hands'], CardType[]]) =>
        <HandWrapper key={playerId} gridArea={playerId as keyof GameStateType['hands']}>
          <PlayerHand
            hidden={playerId !== 'south'}
            cards={hand}
            onPlay={ack?.for === 'play' ? ack.func : undefined}
          />
          <span>{`Bid: ${gameState.bids[playerId]}`}</span>
          <span>{`Taken: ${gameState.taken[playerId]}`}</span>
          <span>{`Score: ${gameState.scores[playerId]}`}</span>
        </HandWrapper>
      )}
      <PileWrapper>
        <CardPile cards={gameState.cardsInTrick} numPlayers={4} />
      </PileWrapper>
      {gameState.phase === 'pre-deal' && ack?.for === 'deal' &&
        <DealButton onClick={ack.func}>{'Deal'}</DealButton>
      }
      {gameState.trumpCard &&
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {cards[gameState.trumpCard.suit][gameState.trumpCard.value]({ height: '10em', width: 'auto' })}
          <span>{'Trump Card'}</span>
        </div>
      }
      {ack?.for === 'bid' &&
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <input
            value={tempBid}
            min={0}
            max={gameState.hands['south'].length}
            onChange={(e) => setTempBid(e.target.valueAsNumber)}
            type={'number'}
          />
          <button onClick={() => ack.func(tempBid)}>{'Place bid'}</button>
        </div>
      }{ack?.for === 'trick_end' &&
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span>{`${ack.winner} won the trick`}</span>
        <button onClick={ack.func}>{'Next trick'}</button>
      </div>
    }
    </GridWrapper>
  );
}
