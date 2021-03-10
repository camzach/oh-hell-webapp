export type CardType = {
  suit: 'clubs' | 'hearts' | 'spades' | 'diamonds'
  value: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'jack' | 'queen' | 'king' | 'ace'
}

export type PublicGameStateType = {
  phase: 'bid' | 'play'
  cardsInTrick: CardType[]
  playedCards: CardType[]
}

export type GameStateType = PublicGameStateType & {
  hand: CardType[]
  waitingForMove: boolean
}

export function playTurn() {

}