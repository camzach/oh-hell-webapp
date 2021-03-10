import * as React from "react";
import { cards as cardImages } from '../card-images';
import { CardPile } from "../card-pile";

export type CardType = {
  suit: 'clubs' | 'hearts' | 'spades' | 'diamonds'
  value: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'jack' | 'queen' | 'king' | 'ace'
}

type Props = {
  cards: CardType[]
  hidden?: boolean
}

export function PlayerHand(props: Props) {
  const { cards, hidden } = props;
  return (
    <>
      {cards.map((card, idx) => {
        const CardImage = hidden ? cardImages.back : cardImages[card.suit][card.value];
        return <CardImage key={idx} height={'10em'} width={'auto'} />
      })}
      <CardPile cards={[{ suit: 'clubs', value: 'ace'}, {suit: 'hearts', value: 4}, {suit: 'diamonds', value: 10}]} numPlayers={4} />
    </>
  );
}