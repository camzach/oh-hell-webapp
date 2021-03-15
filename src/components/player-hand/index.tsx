import * as React from "react";
import { cards as cardImages } from '../card-images';
import { CardPile } from "../card-pile";
import { CardType } from "../game";

type Props = {
  cards: CardType[]
  playerId: string
  hidden?: boolean
  onPlay?: Function
}

export function PlayerHand(props: Props) {
  const { playerId, cards, hidden, onPlay } = props;
  return (
    <div>
      {cards.map((card, idx) => {
        const CardImage = hidden ? cardImages.back : cardImages[card.suit][card.value];
        return <CardImage
          key={idx}
          height={'10em'}
          width={'auto'}
          onClick={(!hidden && onPlay) ?
            (() => onPlay(`${card.value} of ${card.suit}`)) :
            () => {}
          }
        />
      })}
    </div>
  );
}