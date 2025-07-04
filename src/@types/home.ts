export type GameCategoryList =
  | 'Top Games'
  | 'New Games'
  | 'Slots'
  | 'Jackpots'
  | 'Live'
  | 'Blackjack'
  | 'Roulette'
  | 'Table'
  | 'Poker'
  | 'Other';

export type GameCategory = 'top' | 'slots' | 'new' | string; 

export interface GameData {
  categories: GameCategory[];
  name: string;
  image: string;
  id: string;
}

export interface Jackpot {
  game: string;
  amount: number
}