import * as React from 'react';
import { styled } from '@linaria/react';

import two_clubs from './2_of_clubs.png';
import three_clubs from './3_of_clubs.png';
import four_clubs from './4_of_clubs.png';
import five_clubs from './5_of_clubs.png';
import six_clubs from './6_of_clubs.png';
import seven_clubs from './7_of_clubs.png';
import eight_clubs from './8_of_clubs.png';
import nine_clubs from './9_of_clubs.png';
import ten_clubs from './10_of_clubs.png';
import jack_clubs from './jack_of_clubs.png';
import queen_clubs from './queen_of_clubs.png';
import king_clubs from './king_of_clubs.png';
import ace_clubs from './ace_of_clubs.png';

import two_hearts from './2_of_hearts.png';
import three_hearts from './3_of_hearts.png';
import four_hearts from './4_of_hearts.png';
import five_hearts from './5_of_hearts.png';
import six_hearts from './6_of_hearts.png';
import seven_hearts from './7_of_hearts.png';
import eight_hearts from './8_of_hearts.png';
import nine_hearts from './9_of_hearts.png';
import ten_hearts from './10_of_hearts.png';
import jack_hearts from './jack_of_hearts.png';
import queen_hearts from './queen_of_hearts.png';
import king_hearts from './king_of_hearts.png';
import ace_hearts from './ace_of_hearts.png';

import two_spades from './2_of_spades.png';
import three_spades from './3_of_spades.png';
import four_spades from './4_of_spades.png';
import five_spades from './5_of_spades.png';
import six_spades from './6_of_spades.png';
import seven_spades from './7_of_spades.png';
import eight_spades from './8_of_spades.png';
import nine_spades from './9_of_spades.png';
import ten_spades from './10_of_spades.png';
import jack_spades from './jack_of_spades.png';
import queen_spades from './queen_of_spades.png';
import king_spades from './king_of_spades.png';
import ace_spades from './ace_of_spades.png';

import two_diamonds from './2_of_diamonds.png';
import three_diamonds from './3_of_diamonds.png';
import four_diamonds from './4_of_diamonds.png';
import five_diamonds from './5_of_diamonds.png';
import six_diamonds from './6_of_diamonds.png';
import seven_diamonds from './7_of_diamonds.png';
import eight_diamonds from './8_of_diamonds.png';
import nine_diamonds from './9_of_diamonds.png';
import ten_diamonds from './10_of_diamonds.png';
import jack_diamonds from './jack_of_diamonds.png';
import queen_diamonds from './queen_of_diamonds.png';
import king_diamonds from './king_of_diamonds.png';
import ace_diamonds from './ace_of_diamonds.png';

import back from './back.png';
import { mapValues } from 'lodash';

const cards = {
  clubs: {
    2: two_clubs,
    3: three_clubs,
    4: four_clubs,
    5: five_clubs,
    6: six_clubs,
    7: seven_clubs,
    8: eight_clubs,
    9: nine_clubs,
    10: ten_clubs,
    jack: jack_clubs,
    queen: queen_clubs,
    king: king_clubs,
    ace: ace_clubs
  },
  hearts: {
    2: two_hearts,
    3: three_hearts,
    4: four_hearts,
    5: five_hearts,
    6: six_hearts,
    7: seven_hearts,
    8: eight_hearts,
    9: nine_hearts,
    10: ten_hearts,
    jack: jack_hearts,
    queen: queen_hearts,
    king: king_hearts,
    ace: ace_hearts
  },
  spades: {
    2: two_spades,
    3: three_spades,
    4: four_spades,
    5: five_spades,
    6: six_spades,
    7: seven_spades,
    8: eight_spades,
    9: nine_spades,
    10: ten_spades,
    jack: jack_spades,
    queen: queen_spades,
    king: king_spades,
    ace: ace_spades
  },
  diamonds: {
    2: two_diamonds,
    3: three_diamonds,
    4: four_diamonds,
    5: five_diamonds,
    6: six_diamonds,
    7: seven_diamonds,
    8: eight_diamonds,
    9: nine_diamonds,
    10: ten_diamonds,
    jack: jack_diamonds,
    queen: queen_diamonds,
    king: king_diamonds,
    ace: ace_diamonds
  },
  // back: {
  //   back: back
  // }
}

const Card = styled.img`
  background-color: white;
  border: 1px solid black;
  border-radius: .25em;
`;

type SuitType = {
  '2': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  '3': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  '4': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  '5': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  '6': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  '7': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  '8': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  '9': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  '10': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  'jack': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  'queen': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  'king': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
  'ace': (props: React.ImgHTMLAttributes<any>) => JSX.Element,
}

type CardImagesType = {
  clubs: SuitType
  hearts: SuitType
  spades: SuitType
  diamonds: SuitType
  back: {
    back: (props: React.ImgHTMLAttributes<any>) => JSX.Element
  }
}

const componentCards: CardImagesType = {
  ...mapValues(cards, (suit) =>
    mapValues(suit, (card) =>
      (props: any) =>
        <Card
          src={card}
          {...props}
        />
    )
  ),
  back: {
    back: (props: any) => <Card src={back} {...props} />
  }
};

export { componentCards as cards };
