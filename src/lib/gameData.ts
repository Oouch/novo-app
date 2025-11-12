import { Hero, Enemy, Item } from '../app/game/types';

// Heróis iniciais
export const INITIAL_HEROES: Omit<Hero, 'id'>[] = [
  {
    name: 'Blade Knight',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 8,
    critChance: 0.1,
    avatar: '⚔️',
  },
];

// Gerador de inimigos baseado no nível do herói
export const generateEnemy = (heroLevel: number, isBoss: boolean = false): Enemy => {
  const enemyLevel = isBoss ? heroLevel + 2 : heroLevel;
  const baseHp = isBoss ? 150 : 80;
  const baseAttack = isBoss ? 18 : 12;
  const baseDefense = isBoss ? 10 : 5;

  const enemies = isBoss
    ? [
        { name: 'Shadow Lord', avatar: '👹' },
        { name: 'Dragon King', avatar: '🐉' },
        { name: 'Dark Sorcerer', avatar: '🧙‍♂️' },
        { name: 'Demon Prince', avatar: '😈' },
        { name: 'Undead Titan', avatar: '💀' },
      ]
    : [
        { name: 'Goblin Warrior', avatar: '👺' },
        { name: 'Skeleton Fighter', avatar: '💀' },
        { name: 'Dark Wolf', avatar: '🐺' },
        { name: 'Evil Mage', avatar: '🧙' },
        { name: 'Orc Brute', avatar: '👹' },
        { name: 'Zombie', avatar: '🧟' },
        { name: 'Bandit', avatar: '🥷' },
      ];

  const enemy = enemies[Math.floor(Math.random() * enemies.length)];
  const levelMultiplier = 1 + (enemyLevel - 1) * 0.15;

  return {
    id: `enemy-${Date.now()}-${Math.random()}`,
    name: enemy.name,
    level: enemyLevel,
    hp: Math.floor(baseHp * levelMultiplier),
    maxHp: Math.floor(baseHp * levelMultiplier),
    attack: Math.floor(baseAttack * levelMultiplier),
    defense: Math.floor(baseDefense * levelMultiplier),
    reward: {
      gold: Math.floor((isBoss ? 100 : 30) * levelMultiplier),
      xp: Math.floor((isBoss ? 80 : 25) * levelMultiplier),
      gems: isBoss ? Math.floor(2 + enemyLevel * 0.5) : undefined,
    },
    avatar: enemy.avatar,
    isBoss,
  };
};

// Itens da loja
export const SHOP_ITEMS: Item[] = [
  // Armas
  {
    id: 'sword-iron',
    name: 'Iron Sword',
    description: '+10 Attack',
    type: 'weapon',
    rarity: 'common',
    price: { gold: 150 },
    effect: { attack: 10 },
    icon: '🗡️',
  },
  {
    id: 'sword-steel',
    name: 'Steel Blade',
    description: '+25 Attack, +5% Crit',
    type: 'weapon',
    rarity: 'rare',
    price: { gold: 500 },
    effect: { attack: 25, critChance: 0.05 },
    icon: '⚔️',
  },
  {
    id: 'sword-legendary',
    name: 'Excalibur',
    description: '+50 Attack, +15% Crit',
    type: 'weapon',
    rarity: 'legendary',
    price: { gems: 50 },
    effect: { attack: 50, critChance: 0.15 },
    icon: '🗡️',
  },
  // Armaduras
  {
    id: 'armor-leather',
    name: 'Leather Armor',
    description: '+15 Defense, +20 HP',
    type: 'armor',
    rarity: 'common',
    price: { gold: 200 },
    effect: { defense: 15, hp: 20 },
    icon: '🛡️',
  },
  {
    id: 'armor-plate',
    name: 'Plate Armor',
    description: '+35 Defense, +50 HP',
    type: 'armor',
    rarity: 'epic',
    price: { gold: 800 },
    effect: { defense: 35, hp: 50 },
    icon: '🛡️',
  },
  {
    id: 'armor-dragon',
    name: 'Dragon Scale Armor',
    description: '+60 Defense, +100 HP, +10% Crit',
    type: 'armor',
    rarity: 'legendary',
    price: { gems: 80 },
    effect: { defense: 60, hp: 100, critChance: 0.1 },
    icon: '🛡️',
  },
  // Poções
  {
    id: 'potion-health',
    name: 'Health Potion',
    description: 'Restore 50% HP',
    type: 'potion',
    rarity: 'common',
    price: { gold: 50 },
    effect: { hp: 50 },
    icon: '🧪',
  },
  {
    id: 'potion-mega',
    name: 'Mega Potion',
    description: 'Restore 100% HP',
    type: 'potion',
    rarity: 'rare',
    price: { gold: 120 },
    effect: { hp: 100 },
    icon: '🧪',
  },
  // Boosts
  {
    id: 'boost-attack',
    name: 'Attack Boost',
    description: '+20 Attack (Permanent)',
    type: 'boost',
    rarity: 'epic',
    price: { gems: 25 },
    effect: { attack: 20 },
    icon: '💪',
  },
  {
    id: 'boost-defense',
    name: 'Defense Boost',
    description: '+20 Defense (Permanent)',
    type: 'boost',
    rarity: 'epic',
    price: { gems: 25 },
    effect: { defense: 20 },
    icon: '🛡️',
  },
];

// Recompensas diárias
export const DAILY_REWARDS = [
  { day: 1, gold: 100, gems: 5 },
  { day: 2, gold: 150, gems: 5 },
  { day: 3, gold: 200, gems: 10 },
  { day: 4, gold: 250, gems: 10 },
  { day: 5, gold: 300, gems: 15 },
  { day: 6, gold: 400, gems: 20 },
  { day: 7, gold: 500, gems: 50 },
];

// Conquistas
export const ACHIEVEMENTS = [
  {
    id: 'first-blood',
    title: 'First Blood',
    description: 'Defeat your first enemy',
    requirement: 1,
    reward: { gold: 50, gems: 5 },
  },
  {
    id: 'warrior',
    title: 'Warrior',
    description: 'Defeat 50 enemies',
    requirement: 50,
    reward: { gold: 500, gems: 20 },
  },
  {
    id: 'legend',
    title: 'Legend',
    description: 'Defeat 200 enemies',
    requirement: 200,
    reward: { gold: 2000, gems: 100 },
  },
  {
    id: 'boss-slayer',
    title: 'Boss Slayer',
    description: 'Defeat 10 bosses',
    requirement: 10,
    reward: { gold: 1000, gems: 50 },
  },
  {
    id: 'level-10',
    title: 'Rising Hero',
    description: 'Reach level 10',
    requirement: 10,
    reward: { gold: 300, gems: 15 },
  },
  {
    id: 'level-25',
    title: 'Champion',
    description: 'Reach level 25',
    requirement: 25,
    reward: { gold: 1000, gems: 50 },
  },
];
