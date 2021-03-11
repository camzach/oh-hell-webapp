import * as React from "react";
import { cards as cardImages } from '../card-images';
import { CardPile } from "../card-pile";
import { CardType } from '../../game-logic';

type Props = {
  cards: CardType[]
  hidden?: boolean
}

export function PlayerHand(props: Props) {
  const { cards, hidden } = props;
  return (
    <div>
      {cards.map((card, idx) => {
        const CardImage = hidden ? cardImages.back : cardImages[card.suit][card.value];
        return <CardImage key={idx} height={'10em'} width={'auto'} onClick={() => console.log(`Played the ${card.value} of ${card.suit}`)} />
      })}
    </div>
  );
}