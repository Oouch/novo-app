import { Hero, Enemy, GameState, BattleLog } from './types';

// Calcular dano de ataque
export const calculateDamage = (
  attacker: Hero | Enemy,
  defender: Hero | Enemy,
  isCrit: boolean = false
): number => {
  const baseDamage = Math.max(1, attacker.attack - defender.defense * 0.5);
  const variance = 0.85 + Math.random() * 0.3; // 85% - 115%
  const damage = Math.floor(baseDamage * variance * (isCrit ? 2 : 1));
  return damage;
};

// Verificar se é crítico
export const isCriticalHit = (critChance: number): boolean => {
  return Math.random() < critChance;
};

// Calcular XP necessário para próximo nível
export const calculateXpForNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.15, level - 1));
};

// Aplicar level up ao herói
export const levelUpHero = (hero: Hero): Hero => {
  const newLevel = hero.level + 1;
  const hpIncrease = 15;
  const attackIncrease = 3;
  const defenseIncrease = 2;

  return {
    ...hero,
    level: newLevel,
    xp: 0,
    xpToNextLevel: calculateXpForNextLevel(newLevel),
    maxHp: hero.maxHp + hpIncrease,
    hp: hero.maxHp + hpIncrease, // Heal completo no level up
    attack: hero.attack + attackIncrease,
    defense: hero.defense + defenseIncrease,
    critChance: hero.critChance + 0.01, // +1% crit por nível
  };
};

// Processar turno de batalha
export const processBattleTurn = (
  hero: Hero,
  enemy: Enemy
): {
  updatedHero: Hero;
  updatedEnemy: Enemy;
  logs: BattleLog[];
} => {
  const logs: BattleLog[] = [];

  // Herói ataca primeiro
  const heroCrit = isCriticalHit(hero.critChance);
  const heroDamage = calculateDamage(hero, enemy, heroCrit);
  const newEnemyHp = Math.max(0, enemy.hp - heroDamage);

  logs.push({
    id: `log-${Date.now()}-1`,
    message: `You dealt ${heroDamage} damage${heroCrit ? ' (CRITICAL!)' : ''}`,
    type: heroCrit ? 'critical' : 'damage',
    timestamp: Date.now(),
  });

  const updatedEnemy = { ...enemy, hp: newEnemyHp };

  // Se inimigo morreu, não ataca de volta
  if (newEnemyHp <= 0) {
    logs.push({
      id: `log-${Date.now()}-2`,
      message: `${enemy.name} defeated! +${enemy.reward.gold} gold, +${enemy.reward.xp} XP`,
      type: 'victory',
      timestamp: Date.now() + 1,
    });
    return { updatedHero: hero, updatedEnemy, logs };
  }

  // Inimigo ataca
  const enemyDamage = calculateDamage(enemy, hero);
  const newHeroHp = Math.max(0, hero.hp - enemyDamage);

  logs.push({
    id: `log-${Date.now()}-3`,
    message: `${enemy.name} dealt ${enemyDamage} damage to you`,
    type: 'damage',
    timestamp: Date.now() + 2,
  });

  const updatedHero = { ...hero, hp: newHeroHp };

  return { updatedHero, updatedEnemy, logs };
};

// Aplicar efeito de item ao herói
export const applyItemEffect = (hero: Hero, effect: any): Hero => {
  return {
    ...hero,
    attack: hero.attack + (effect.attack || 0),
    defense: hero.defense + (effect.defense || 0),
    maxHp: hero.maxHp + (effect.hp || 0),
    hp: hero.hp + (effect.hp || 0),
    critChance: Math.min(1, hero.critChance + (effect.critChance || 0)),
  };
};

// Verificar se pode reivindicar recompensa diária
export const canClaimDailyReward = (lastClaimed: string | null): boolean => {
  if (!lastClaimed) return true;
  const lastClaimedDate = new Date(lastClaimed);
  const today = new Date();
  return lastClaimedDate.toDateString() !== today.toDateString();
};

// Calcular streak de dias consecutivos
export const calculateStreak = (lastClaimed: string | null): number => {
  if (!lastClaimed) return 0;
  const lastClaimedDate = new Date(lastClaimed);
  const today = new Date();
  const diffTime = today.getTime() - lastClaimedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Se passou mais de 1 dia, streak quebrou
  if (diffDays > 1) return 0;
  
  // Se passou exatamente 1 dia, mantém streak
  return diffDays === 1 ? 1 : 0;
};
