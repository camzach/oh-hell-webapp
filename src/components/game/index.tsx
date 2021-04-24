import * as React from "react";
import { CardPile } from "../card-pile";
import { PlayerHand } from "../player-hand";
import { styled } from '@linaria/react';
import { cards } from '../card-images';
import { cloneDeep } from "lodash";

const SocketIO: SocketIOClientStatic = require('socket.io-client');
// @ts-ignore SERVER is defined by webpack
const ENDPOINT = SERVER;

const GridWrapper = styled.div`
  display: grid;
  grid-template: 20em auto 20em / 20em auto 20em;
  grid-template-areas: "nw   north ne"
                       "west pile  east"
                       "sw   south se";
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
  width: 100%;
  height: 100%;
`;
const DealButton = styled.button`
  background-color: #acacac;
  border-radius: 1em;
  font-size: 4em;
`;
const CornerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export type CardType = {
  suit: 'clubs' | 'hearts' | 'spades' | 'diamonds'
  value: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'jack' | 'queen' | 'king' | 'ace'
}

type AIType = {
  is_ai: true
  algorithm: 'MCTS'
  search_time: number
} | {
  is_ai: true
  algorithm: 'AlphaBeta'
  max_depth: number
} | {
  is_ai: true
  algorithm: 'random'
}

type GameStateType = {
  players: [
    { name: 'south' },
    { name: 'west' } & AIType,
    { name: 'north' } & AIType,
    { name: 'east' } & AIType
  ]
  hands: {
    north: CardType[]
    south: CardType[]
    east: CardType[]
    west: CardType[]
  }
  bids: {
    north: number | null
    south: number | null
    east: number | null
    west: number | null
  }
  taken: {
    north: number
    south: number
    east: number
    west: number
  }
  scores: Array<{
    north: number
    south: number
    east: number
    west: number
  }>
  phase: 'play' | 'bid' | 'pre-deal'
  cardsInTrick: Array<CardType | null>
  trumpCard: CardType | null
  leadSuit: CardType['suit'] | null
  dealer: 'north' | 'south' | 'east' | 'west' | null
}

type AckType = {
  for: 'start',
  func: () => void
} | {
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

const defaultAlphaBetaDepth = 3;
const defaultMCTSSearchTime = 1;

const clearedState: GameStateType = {
  players: [
    { name: 'south' },
    { name: 'west', is_ai: true, algorithm: 'random' },
    { name: 'north', is_ai: true, algorithm: 'random' },
    { name: 'east', is_ai: true, algorithm: 'random' }
  ],
  phase: 'pre-deal',
  cardsInTrick: [ null, null, null, null ],
  trumpCard: null,
  leadSuit: null,
  dealer: null,
  hands: {
    north: [],
    south: [],
    east: [],
    west: []
  },
  bids: {
    north: null,
    south: null,
    east: null,
    west: null
  },
  taken: {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  },
  scores: []
}

export function Game() {
  const [ gameState, setGameState ] = React.useState<GameStateType>(clearedState);
  const [ ack, setAck ] = React.useState<AckType | null>(null);
  const [ tempBid, setTempBid ] = React.useState(0);
  React.useEffect(() => {
    const socket = SocketIO(ENDPOINT);
    socket.on('connect', () => {
      setAck({
        for: 'start',
        func: () => {
          socket.emit('new_game', {
            players: gameState.players,
            max_hand: 7
          });
        }
      })
    });
    socket.on('game_init', (update: any) => {
      if ('success' in update) {
        setAck({ for: 'deal', func: () => socket.emit('deal') });
      }
    });
    socket.on('dealer', (data: string) => {
      const dealerName = data as GameStateType['dealer'];
      setGameState((old) => ({ ...old, dealer: dealerName }));
    });
    socket.on('hands', (data: { [playerId: string]: string[] }) => setGameState((old) => {
      const hands = Object.entries(data).reduce((acc, [ key, hand ]) => {
        const newHand = hand.map((card) => {
          const [ value, suit ] = card.toLowerCase().split(' of ');
          return { suit, value };
        });
        return { ...acc, [key]: newHand };
      }, { north: [], south: [], east: [], west: []});
      return { ...old, phase: 'bid', hands };
    }));
    socket.on('bid_request', (bids: Partial<GameStateType['bids']>, thisAck: Function) => {
      setGameState((old) => {
        const newBids = bids as GameStateType['bids'];
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
        const playerIdx = gameState.players.findIndex((player) => player.name === data.player);
        if (!playerIdx) {
          return old;
        }
        const [ value, suit ] = data.card.toLowerCase().split(' of ');
        played[playerIdx] = { value, suit } as CardType;
        const newHands = cloneDeep(old.hands);
        const playerName = data.player as keyof GameStateType['hands'];
        newHands[playerName] = newHands[playerName].filter((card) => card.value !== value || card.suit !== suit);
        return { ...old, cardsInTrick: played, hands: newHands };
      })
    });
    socket.on('trump', (data: string) => {
      const [ value, suit ] = data.toLowerCase().split(' of ') as [ CardType['value'], CardType['suit']];
      setGameState((old) => ({ ...old, trumpCard: { value, suit } }));
    });
    socket.on('bids', (bids: GameStateType['bids']) => {
      setGameState((old) => {
        const newBids = bids as GameStateType['bids'];
        return { ...old, bids: newBids, phase: 'play' };
      })
    });
    socket.on('lead_suit', (data: CardType['suit']) => {
      setGameState((old) => ({
        ...old,
        leadSuit: data.toLowerCase() as CardType['suit']
      }));
    });
    socket.on('trick_winner', (winner: string, ack: () => void) => {
      const winnerName = winner as keyof GameStateType['taken'];
      setGameState((old) => ({
        ...old,
        taken: {
          ...old.taken,
          [winnerName]: old.taken[winnerName] + 1
        }
      }))
      setAck({ for: 'trick_end', winner: winnerName, func: () => {
        ack();
        setGameState((old) => ({
          ...old,
          cardsInTrick: [],
          leadSuit: null
        }));
      }});
    })
    socket.on('round_end', () => {
      setGameState((old) => ({
        ...clearedState,
        scores: old.scores,
        players: old.players
      }));
      setAck({ for: 'deal', func: () => socket.emit('deal') });
    });
    socket.on('scores', (scores: GameStateType['scores'][0]) => {
      setGameState((old) => ({
        ...old,
        scores: [...old.scores, scores] as GameStateType['scores']
      }));
    });
    socket.on('disconnect', () => {
      alert('disconnected');
    });
    socket.on('error', console.log);
  }, []);

  return (
    <GridWrapper>
      {gameState.phase === 'pre-deal' && ack?.for === 'start' ?
        gameState.players.map((player, index) =>
          // No AI setup for south, that's a human player
          player.name === 'south' ? null :
          <HandWrapper key={player.name} gridArea={player.name as keyof GameStateType['hands']}>
            <div>{`Setup for ${player.name}`}</div>
            <select
              // @ts-ignore
              value={gameState.players[index].algorithm}
              onChange={(e) => setGameState((old) => {
                const newPlayers = old.players;
                // @ts-ignore
                newPlayers[index].algorithm = e.target.value;
                if (e.target.value === 'MCTS') {
                  // @ts-ignore
                  newPlayers[index]['search_time'] = defaultMCTSSearchTime;
                } else if (e.target.value === 'AlphaBeta') {
                  // @ts-ignore
                  newPlayers[index]['max_depth'] = defaultAlphaBetaDepth;
                }
                return { ...old, players: newPlayers };
              })}
            >
              <option>{'random'}</option>
              <option>{'MCTS'}</option>
              <option>{'AlphaBeta'}</option>
            </select>
            {(() => {
              // @ts-ignore
              switch(player.algorithm) {
                case 'MCTS':
                  return (
                    <input
                      type={'number'}
                      step={0.05}
                      // @ts-ignore
                      value={gameState.players[index]['search_time'] || defaultMCTSSearchTime}
                      onChange={(e) => setGameState((old) => {
                        const newPlayers = old.players;
                        // @ts-ignore
                        newPlayers[index]['search_time'] = parseFloat(e.target.value);
                        return { ...old, players: newPlayers };
                      })}
                      placeholder={'search time'}
                    />
                  );
                case 'AlphaBeta':
                  return (
                    <input
                      type={'number'}
                      step={0.05}
                      // @ts-ignore
                      value={gameState.players[index]['max_depth'] || defaultAlphaBetaDepth}
                      onChange={(e) => setGameState((old) => {
                        const newPlayers = old.players;
                        // @ts-ignore
                        newPlayers[index]['max_depth'] = parseFloat(e.target.value);
                        return { ...old, players: newPlayers };
                      })}
                      placeholder={'max depth'}
                    />
                  );
                default:
                  return null;
              }
            })()}
          </HandWrapper>) :
        Object.entries(gameState.hands).map(([ playerId, hand ]: [keyof GameStateType['hands'], CardType[]]) =>
          <HandWrapper key={playerId} gridArea={playerId as keyof GameStateType['hands']}>
            <PlayerHand
              hidden={playerId !== 'south'}
              cards={hand}
              leadSuit={gameState.leadSuit}
              onPlay={ack?.for === 'play' ? ack.func : undefined}
            />
            {gameState.dealer === playerId && <span>{'Dealer'}</span>}
            {gameState.bids[playerId] !== null && <span>{`Bid: ${gameState.bids[playerId]}`}</span>}
            {gameState.phase === 'play' && <span>{`Taken: ${gameState.taken[playerId]}`}</span>}
            <span>{`Score: ${gameState.scores.slice(-1)?.[0]?.[playerId] ?? 0}`}</span>
          </HandWrapper>
        )}
      <PileWrapper>
        <CardPile cards={gameState.cardsInTrick} numPlayers={4} />
      </PileWrapper>
      {gameState.phase === 'pre-deal' && ack?.for === 'start' &&
        <DealButton onClick={ack.func}>{'New game'}</DealButton>
      }
      {gameState.phase === 'pre-deal' && ack?.for === 'deal' &&
        <DealButton onClick={ack.func}>{'Deal'}</DealButton>
      }
      {gameState.trumpCard &&
        <CornerInfo>
          {cards[gameState.trumpCard.suit][gameState.trumpCard.value]({ style: { height: '10em', width: 'auto' } })}
          <span>{'Trump Card'}</span>
        </CornerInfo>
      }
      {ack?.for === 'bid' &&
        <CornerInfo>
          <input
            value={tempBid}
            min={0}
            max={gameState.hands['south'].length}
            onChange={(e) => setTempBid(e.target.valueAsNumber)}
            type={'number'}
          />
          <button onClick={() => ack.func(tempBid)}>{'Place bid'}</button>
        </CornerInfo>
      }
      {ack?.for === 'trick_end' &&
      <CornerInfo>
        <span>{`${ack.winner} won the trick`}</span>
        <button onClick={ack.func}>{'Next trick'}</button>
      </CornerInfo>
    }
    {gameState.leadSuit &&
      <CornerInfo>
        <span>{`Lead suit is ${gameState.leadSuit}`}</span>
      </CornerInfo>
    }
    <CornerInfo style={{ gridArea: 'sw' }}>
      <table>
        <thead>
          <tr>
          <th>Round</th>
          <th>North</th>
          <th>South</th>
          <th>East</th>
          <th>West</th>
          </tr>
        </thead>
        <tbody>
        {gameState.scores.map((row, idx) =>
          <tr key={idx}>
            <td>{idx + 1}</td>
            <td>{row.north}</td>
            <td>{row.south}</td>
            <td>{row.east}</td>
            <td>{row.west}</td>
          </tr>
        )}
        </tbody>
      </table>
    </CornerInfo>
    </GridWrapper>
  );
}
