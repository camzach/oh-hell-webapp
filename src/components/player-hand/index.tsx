import * as React from "react";
import { cards as cardImages } from '../card-images';
import { CardType } from "../game";
import { styled } from '@linaria/react';

const HandWrapper = styled.div`
  display: flex;
  max-width: 20em;
  & : last-child {
    flex: 1 0 auto;
  }
`;
const CardWrapper = styled.div`
  flex: 1 0 0;
  overflow-x: hidden;
`;

type Props = {
  cards: CardType[]
  hidden?: boolean
  onPlay?: (card: CardType) => void
  leadSuit: CardType['suit'] | null
}

export function PlayerHand(props: Props) {
  const { cards, hidden, leadSuit, onPlay } = props;
  return (
    <HandWrapper>
      {cards.map((card, idx) => {
        const CardImage = hidden ? cardImages.back.back : cardImages[card.suit][card.value];
        const canPlayCard = !hidden && onPlay && (!!leadSuit ? card.suit === leadSuit || cards.every((c) => c.suit !== leadSuit) : true);
        return (
          <CardWrapper
            key={idx}
          >
            <CardImage
              style={{
                height: '10em',
                border: canPlayCard ? '1px solid goldenrod' : undefined
              }}
              onClick={canPlayCard ?
                // @ts-ignore onPlay exists when canPlayCard is true
                (() => onPlay(card)) :
                () => {}
              }
            />
          </CardWrapper>
        );
      })}
    </HandWrapper>
  );
}