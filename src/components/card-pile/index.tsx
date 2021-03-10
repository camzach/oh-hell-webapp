import * as React from 'react';
import { CardType } from '../player-hand';
import { styled } from '@linaria/react';
import { cards as cardImages } from '../card-images';

type Props = {
  cards: CardType[]
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
  console.log(cards);
  return (
    <Pile>
      {cards.map((card, idx) =>
        <RotatedCard key={idx} angle={idx * angle} as={cardImages[card.suit][card.value]} />
      )}
    </Pile>
  );
}