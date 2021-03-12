import * as React from "react";
import { cards as cardImages } from '../card-images';
import { CardPile } from "../card-pile";
import { CardType } from '../../game-logic';
import { GameActionType } from "../game";

type Props = {
  cards: CardType[]
  playerId: string
  hidden?: boolean
  dispatch: React.Dispatch<GameActionType>
}

export function PlayerHand(props: Props) {
  const { playerId, cards, hidden, dispatch } = props;
  return (
    <div>
      {cards.map((card, idx) => {
        const CardImage = hidden ? cardImages.back : cardImages[card.suit][card.value];
        return <CardImage
          key={idx}
          height={'10em'}
          width={'auto'}
          onClick={!hidden ?
            (() => dispatch({ type: 'play', playerId: playerId })) :
            () => {}
          }
        />
      })}
    </div>
  );
}