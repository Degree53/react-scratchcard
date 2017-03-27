import React from 'react';
import { render } from 'react-dom';

import ScratchCard from '../../src';
import cardImage from './card.jpg';

const settings = {
  width: 480,
  height: 480,
  image: cardImage,
  finishPercent: 75,
  onComplete: () => console.log('The card is now clear!')
};

const Example = () =>
  <ScratchCard {...settings}>
    <p>Congratulations! You WON!</p>
  </ScratchCard>;

render(<Example />, document.getElementById('root'));
