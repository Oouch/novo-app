// Types para o jogo Hero's Quest

export interface Hero {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  critChance: number;
  avatar: string;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  reward: {
    gold: number;
    xp: number;
    gems?: number;
  };
  avatar: string;
  isBoss: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'potion' | 'boost';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: {
    gold?: number;
    gems?: number;
  };
  effect: {
    attack?: number;
    defense?: number;
    hp?: number;
    critChance?: number;
  };
  icon: string;
}

export interface GameState {
  hero: Hero;
  currentEnemy: Enemy | null;
  gold: number;
  gems: number;
  inventory: Item[];
  equippedItems: {
    weapon?: Item;
    armor?: Item;
  };
  stats: {
    enemiesDefeated: number;
    bossesDefeated: number;
    totalDamageDealt: number;
    highestLevel: number;
  };
  dailyRewards: {
    lastClaimed: string | null;
    streak: number;
  };
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  current: number;
  completed: boolean;
  reward: {
    gold?: number;
    gems?: number;
  };
}

export interface BattleLog {
  id: string;
  message: string;
  type: 'damage' | 'heal' | 'critical' | 'victory' | 'levelup';
  timestamp: number;
}
