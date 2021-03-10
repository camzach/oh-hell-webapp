import { CardType, GameStateType } from ".."

type AIType = {
  bid: (state: GameStateType) => number
  play: (state: GameStateType) => CardType
}

const defaultAI: AIType = {
  bid: () => 0,
  play: (state: GameStateType) => state.hand[0]
}

export { defaultAI }
