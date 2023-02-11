import { ICard } from '../types/interfaces';
import { CARD_DECK, POKER_COMBINATIONS } from '../utils/constants';

interface IValueMap {
  [key: string]: number;
}

const VALUE_MAP: IValueMap = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 7,
  9: 8,
  10: 9,
  J: 10,
  Q: 11,
  K: 12,
  A: 13,
};

const randomizePosition = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateDeckOfCards = () => {
  const deck: ICard[] = [];
  for (const suit of CARD_DECK.suits) {
    for (const card of CARD_DECK.cards) {
      deck.push({
        cardFace: card,
        suit: suit,
        value: VALUE_MAP[card],
      });
    }
  }
  return deck;
};

export const shuffle = (): ICard[] => {
  const deck = generateDeckOfCards();
  const shuffledDeck = new Array(CARD_DECK.totalNumCards);
  const filledSlots: number[] = [];
  for (let i = 0; i < CARD_DECK.totalNumCards; i++) {
    if (i === 51) {
      const lastSlot = shuffledDeck.findIndex((el) => typeof el == 'undefined');
      shuffledDeck[lastSlot] = deck[i];
      filledSlots.push(lastSlot);
    } else {
      let shuffleToPosition = randomizePosition(0, CARD_DECK.totalNumCards - 1);
      while (filledSlots.includes(shuffleToPosition)) {
        shuffleToPosition = randomizePosition(0, CARD_DECK.totalNumCards - 1);
      }
      shuffledDeck[shuffleToPosition] = deck[i];
      filledSlots.push(shuffleToPosition);
    }
  }
  return shuffledDeck;
};

export const deal = (count: number, deck: ICard[]) => {
  let currentCard = 0;
  const hands = Array(count);
  for (let i = 0; i < count; i += 1) {
    hands[i] = [deck[currentCard], deck[currentCard + 1]];
    currentCard += 2;
  }
  return hands;
};

export const findBestCombination = (
  board: ICard[],
  hand: ICard[]
): { bestFiveCards: ICard[]; bestCombination: ICard[]; combinationRating: number } => {
  const bestCombination: ICard[] = [];
  const bestFiveCards: ICard[] = [];
  let combinationRating = 0;
  const concatCards = [...board, ...hand];
  const sortCardsByValue = concatCards.sort((a, b) => (a.value > b.value ? 1 : -1));
  const combineCardsByValue = concatCards.reduce((a, b) => {
    Object.prototype.hasOwnProperty.call(a, b.cardFace)
      ? a[b.cardFace].push(b)
      : (a[b.cardFace] = [b]);
    return a;
  }, {} as { [cardFace: string]: ICard[] });
  const combineCardsBySuit = concatCards.reduce((a, b) => {
    Object.prototype.hasOwnProperty.call(a, b.suit) ? a[b.suit].push(b) : (a[b.suit] = [b]);
    // a.hasOwnProperty(b.suit) ? a[b.suit].push(b) : (a[b.suit] = [b]);
    return a;
  }, {} as { [suit: string]: ICard[] });

  //RoyalFlush, StraightFlush, Flush
  //TODO StraightFlush `A2345`
  const fiveCardsBySuit = Object.entries(combineCardsBySuit).filter((obj) => obj[1].length >= 5);

  if (fiveCardsBySuit.length) {
    const cardValues = fiveCardsBySuit[0][1].map((c) => c.value).sort((a, b) => b - a);
    for (let i = 0; i <= cardValues.length - 5; i++) {
      if (cardValues[i] - cardValues[i + 4] === 4) {
        combinationRating =
          i === 0 ? POKER_COMBINATIONS.ROYAL_FLUSH : POKER_COMBINATIONS.STRAIGHT_FLUSH;
        bestCombination.push(...fiveCardsBySuit[0][1].slice(2 - i, 7 - i));
        bestFiveCards.push(...bestCombination);
        return { bestCombination, bestFiveCards, combinationRating };
      }
    }
  }

  //FourKind
  const fourCardsByValue = Object.entries(combineCardsByValue).filter((obj) => obj[1].length === 4);

  if (fourCardsByValue.length) {
    combinationRating = POKER_COMBINATIONS.FOUR_KIND;
    bestCombination.push(...fourCardsByValue[0][1]);
    const lastBestCard = sortCardsByValue
      .filter((obj) => obj.cardFace !== fourCardsByValue[0][0])
      .pop();
    lastBestCard && bestFiveCards.push(lastBestCard);
    return { bestCombination, bestFiveCards, combinationRating };
  }

  //FullHouse
  const threeCardsByValue = Object.entries(combineCardsByValue).filter(
    (obj) => obj[1].length === 3
  );
  const twoCardsByValue = Object.entries(combineCardsByValue).filter((obj) => obj[1].length >= 2);
  if (threeCardsByValue.length && twoCardsByValue.length) {
    if (threeCardsByValue.length === 1 && twoCardsByValue.length > 1) {
      console.log('im in cicle threeCards && twoCards');
      const TC = twoCardsByValue.filter((obj) => obj[0] !== threeCardsByValue[0][0]);
      bestCombination.push(...threeCardsByValue[0][1], ...TC[TC.length - 1][1].slice(0, 2));
      combinationRating = POKER_COMBINATIONS.FULL_HOUSE;
      return { bestCombination, bestFiveCards, combinationRating };
    }
    if (twoCardsByValue.length === 1 && threeCardsByValue.length > 1) {
      const TC = threeCardsByValue.filter((obj) => obj[0] !== twoCardsByValue[0][0]);
      bestCombination.push(...twoCardsByValue[0][1], ...TC[0][1]);
      combinationRating = POKER_COMBINATIONS.FULL_HOUSE;
      return { bestCombination, bestFiveCards, combinationRating };
    }
    if (twoCardsByValue.length > 1 && threeCardsByValue.length > 1) {
      const bestThree = threeCardsByValue[threeCardsByValue.length - 1];
      const bestTwo = twoCardsByValue.filter((obj) => obj[0] !== bestThree[0][0]);
      bestCombination.push(...bestThree[1], ...bestTwo[bestTwo.length - 1][1].slice(0, 2));
      combinationRating = POKER_COMBINATIONS.FULL_HOUSE;
      return { bestCombination, bestFiveCards, combinationRating };
    }
  }

  //flush
  if (fiveCardsBySuit.length) {
    console.log('fiveCardsBySuit CYCLE');
    console.log('fiveCardsBySuit', fiveCardsBySuit);
    combinationRating = POKER_COMBINATIONS.FLUSH;
    bestCombination.push(...fiveCardsBySuit[0][1].slice(-5));
    return { bestCombination, bestFiveCards, combinationRating };
  }

  // street
  //TODO Street `A2345`
  if (Object.keys(combineCardsByValue).length >= 5) {
    const cardValues = sortCardsByValue.map((c) => c.value).sort((a, b) => b - a);
    console.log('STREET cardValues', cardValues);
    for (let i = 0; i < 3; i++) {
      if (cardValues[i] - cardValues[i + 4] === 4) {
        combinationRating = POKER_COMBINATIONS.STRAIGHT;
        bestCombination.push(...sortCardsByValue.slice(2 - i, 7 - i));
        return { bestCombination, bestFiveCards, combinationRating };
      }
    }
  }

  //ONE tree
  if (threeCardsByValue.length) {
    const bestThree = threeCardsByValue[threeCardsByValue.length - 1];
    bestCombination.push(...bestThree[1]);
    const lastBestCards = sortCardsByValue
      .filter((obj) => obj.cardFace !== bestThree[0][0])
      .slice(-2);
    bestFiveCards.push(...lastBestCards);
    combinationRating = POKER_COMBINATIONS.THREE_KIND;
    return { bestCombination, bestFiveCards, combinationRating };
  }

  //two PAIRs
  if (twoCardsByValue.length >= 2) {
    const bestTwo = twoCardsByValue.slice(-2).map((obj) => obj[1]);
    const bestTwoNames = twoCardsByValue.slice(-2).map((obj) => obj[0]);
    bestCombination.push(...bestTwo[0].concat(bestTwo[1]));
    const lastBestCard = sortCardsByValue
      .filter((obj) => obj.cardFace !== bestTwoNames[0] && obj.cardFace !== bestTwoNames[1])
      .slice(-1);
    bestFiveCards.push(...lastBestCard);
    combinationRating = POKER_COMBINATIONS.TWO_PAIRS;
    return { bestCombination, bestFiveCards, combinationRating };
  }

  //one PAIRs
  if (twoCardsByValue.length === 1) {
    bestCombination.push(...twoCardsByValue[0][1]);
    const lastBestCards = sortCardsByValue
      .filter((obj) => obj.cardFace !== twoCardsByValue[0][0])
      .slice(-3);
    bestFiveCards.push(...lastBestCards);
    combinationRating = POKER_COMBINATIONS.ONE_PAIR;
    return { bestCombination, bestFiveCards, combinationRating };
  }

  bestCombination.push(...sortCardsByValue.slice(-1));
  bestFiveCards.push(...sortCardsByValue.slice(-5, -1));
  combinationRating = POKER_COMBINATIONS.HIGH_CARD;

  return { bestCombination, bestFiveCards, combinationRating };
};
