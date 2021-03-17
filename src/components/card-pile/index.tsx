import * as React from 'react';
import { styled } from '@linaria/react';
import { cards as cardImages } from '../card-images';
import { CardType } from '../game';

type Props = {
  cards: Array<CardType | null>
  numPlayers: number
}

const RotatedCard = styled.img<{ angle: number }>`
  transform-origin: top center;
  transform: translate(-50%) rotate(${props => props.angle}deg);
  height: 10em;
  width: auto;
  position: absolute;
  top: 50%;
  left: 50%;
`;

const Pile = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

export function CardPile(props: Props) {
  const { cards, numPlayers } = props;
  const angle = 360 / numPlayers;
  return (
    <Pile>
      {cards.map((card, idx) =>
        !!card &&
        <RotatedCard
          key={idx}
          angle={idx * angle}
          as={cardImages[card.suit][card.value]}
        />
      )}
    </Pile>
  );
}
