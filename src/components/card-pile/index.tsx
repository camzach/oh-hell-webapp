import * as React from 'react';
import { styled } from '@linaria/react';
import { cards as cardImages } from '../card-images';
import { CardType } from '../game';

type Props = {
  cards: Array<CardType | null>
  numPlayers: number
}

const RotatedCard = styled.svg<{ angle: number }>`
  transform-origin: top center;
  transform: rotate(${props => props.angle}deg);
  height: 10em;
  width: 100%;
  position: absolute;
  top: 50%;
`;

const Pile = styled.div`
  height: 20em;
  width: 20em;
  border: 2px solid black;
  position: relative;
`;

export function CardPile(props: Props) {
  const { cards, numPlayers } = props;
  const angle = 360 / numPlayers;
  return (
    <Pile>
      {cards.map((card, idx) =>
        !!card &&
        <RotatedCard key={idx} angle={idx * angle} as={cardImages[card.suit][card.value]} />
      )}
    </Pile>
  );
}
