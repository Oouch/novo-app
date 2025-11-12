'use client';

import { useState, useEffect, useCallback } from 'react';
import { Hero, Enemy, GameState, BattleLog, Item, Achievement } from './game/types';
import { INITIAL_HEROES, generateEnemy, DAILY_REWARDS, ACHIEVEMENTS } from '@/lib/gameData';
import {
  processBattleTurn,
  levelUpHero,
  applyItemEffect,
  canClaimDailyReward,
  calculateStreak,
} from './game/gameLogic';
import GameUI from '@/components/custom/GameUI';
import Shop from '@/components/custom/Shop';
import DailyRewards from '@/components/custom/DailyRewards';
import {
  ShoppingBag,
  Trophy,
  Gift,
  Dices,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

// Estado inicial padrão (usado tanto no servidor quanto no cliente)
const getInitialState = (): GameState => ({
  hero: {
    ...INITIAL_HEROES[0],
    id: 'hero-1',
  },
  currentEnemy: null,
  gold: 100,
  gems: 10,
  inventory: [],
  equippedItems: {},
  stats: {
    enemiesDefeated: 0,
    bossesDefeated: 0,
    totalDamageDealt: 0,
    highestLevel: 1,
  },
  dailyRewards: {
    lastClaimed: null,
    streak: 0,
  },
  achievements: ACHIEVEMENTS.map((a) => ({
    ...a,
    current: 0,
    completed: false,
  })),
});

export default function HeroQuestGame() {
  // Flag para saber se está no cliente
  const [mounted, setMounted] = useState(false);
  
  // Game State - sempre inicia com estado padrão
  const [gameState, setGameState] = useState<GameState>(getInitialState);

  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [autoAttackEnabled, setAutoAttackEnabled] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  // Carregar do localStorage APENAS no cliente após montagem
  useEffect(() => {
    setMounted(true);
    
    const saved = localStorage.getItem('heroQuestSave');
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load save:', error);
      }
    }
  }, []);

  // Salvar no localStorage apenas quando montado
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('heroQuestSave', JSON.stringify(gameState));
    }
  }, [gameState, mounted]);

  // Auto-attack loop
  useEffect(() => {
    if (!autoAttackEnabled || !gameState.currentEnemy || gameState.hero.hp <= 0) {
      return;
    }

    const interval = setInterval(() => {
      handleAttack();
    }, 1500);

    return () => clearInterval(interval);
  }, [autoAttackEnabled, gameState.currentEnemy, gameState.hero.hp]);

  // Adicionar log
  const addLog = (message: string, type: BattleLog['type']) => {
    const log: BattleLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: Date.now(),
    };
    setBattleLogs((prev) => [...prev, log]);
  };

  // Verificar e atualizar conquistas
  const checkAchievements = useCallback((updatedState: GameState) => {
    const newAchievements = updatedState.achievements.map((achievement) => {
      if (achievement.completed) return achievement;

      let current = achievement.current;

      if (achievement.id === 'first-blood' || achievement.id === 'warrior' || achievement.id === 'legend') {
        current = updatedState.stats.enemiesDefeated;
      } else if (achievement.id === 'boss-slayer') {
        current = updatedState.stats.bossesDefeated;
      } else if (achievement.id === 'level-10' || achievement.id === 'level-25') {
        current = updatedState.hero.level;
      }

      const completed = current >= achievement.requirement;

      if (completed && !achievement.completed) {
        // Recompensar
        addLog(
          `🏆 Achievement Unlocked: ${achievement.title}! +${achievement.reward.gold || 0} gold, +${achievement.reward.gems || 0} gems`,
          'victory'
        );
        updatedState.gold += achievement.reward.gold || 0;
        updatedState.gems += achievement.reward.gems || 0;
      }

      return { ...achievement, current, completed };
    });

    return newAchievements;
  }, []);

  // Atacar
  const handleAttack = () => {
    if (gameState.hero.hp <= 0) {
      addLog('You are defeated! Heal to continue.', 'damage');
      return;
    }

    // Se não há inimigo, gerar um novo
    if (!gameState.currentEnemy) {
      const isBoss = Math.random() < 0.15; // 15% chance de boss
      const newEnemy = generateEnemy(gameState.hero.level, isBoss);
      setGameState((prev) => ({ ...prev, currentEnemy: newEnemy }));
      addLog(`A wild ${newEnemy.name} appears!`, 'damage');
      return;
    }

    // Processar turno de batalha
    const { updatedHero, updatedEnemy, logs } = processBattleTurn(
      gameState.hero,
      gameState.currentEnemy
    );

    // Adicionar logs
    logs.forEach((log) => {
      setBattleLogs((prev) => [...prev, log]);
    });

    // Atualizar estado
    let newState = {
      ...gameState,
      hero: updatedHero,
      currentEnemy: updatedEnemy,
    };

    // Se inimigo morreu
    if (updatedEnemy.hp <= 0) {
      // Adicionar recompensas
      newState.gold += updatedEnemy.reward.gold;
      newState.hero.xp += updatedEnemy.reward.xp;
      if (updatedEnemy.reward.gems) {
        newState.gems += updatedEnemy.reward.gems;
      }

      // Atualizar stats
      newState.stats.enemiesDefeated += 1;
      if (updatedEnemy.isBoss) {
        newState.stats.bossesDefeated += 1;
      }

      // Verificar level up
      while (newState.hero.xp >= newState.hero.xpToNextLevel) {
        newState.hero = levelUpHero(newState.hero);
        addLog(`🎉 LEVEL UP! You are now level ${newState.hero.level}!`, 'levelup');
        if (newState.hero.level > newState.stats.highestLevel) {
          newState.stats.highestLevel = newState.hero.level;
        }
      }

      // Verificar conquistas
      newState.achievements = checkAchievements(newState);

      // Remover inimigo
      newState.currentEnemy = null;
    }

    setGameState(newState);
  };

  // Curar
  const handleHeal = () => {
    if (gameState.gold < 50) {
      addLog('Not enough gold to heal!', 'damage');
      return;
    }

    if (gameState.hero.hp >= gameState.hero.maxHp) {
      addLog('HP is already full!', 'damage');
      return;
    }

    setGameState((prev) => ({
      ...prev,
      gold: prev.gold - 50,
      hero: {
        ...prev.hero,
        hp: prev.hero.maxHp,
      },
    }));
    addLog('Healed to full HP!', 'heal');
  };

  // Comprar item
  const handleBuyItem = (item: Item) => {
    if (item.price.gold && gameState.gold < item.price.gold) {
      addLog('Not enough gold!', 'damage');
      return;
    }
    if (item.price.gems && gameState.gems < item.price.gems) {
      addLog('Not enough gems!', 'damage');
      return;
    }

    let newHero = gameState.hero;

    // Aplicar efeito se for boost ou poção
    if (item.type === 'boost') {
      newHero = applyItemEffect(gameState.hero, item.effect);
      addLog(`Used ${item.name}! Stats permanently increased!`, 'victory');
    } else if (item.type === 'potion') {
      const healAmount = item.effect.hp || 0;
      const healPercent = healAmount / 100;
      const actualHeal = Math.floor(gameState.hero.maxHp * healPercent);
      newHero = {
        ...gameState.hero,
        hp: Math.min(gameState.hero.maxHp, gameState.hero.hp + actualHeal),
      };
      addLog(`Used ${item.name}! Restored ${actualHeal} HP!`, 'heal');
    }

    setGameState((prev) => ({
      ...prev,
      gold: prev.gold - (item.price.gold || 0),
      gems: prev.gems - (item.price.gems || 0),
      hero: newHero,
      inventory:
        item.type === 'weapon' || item.type === 'armor'
          ? [...prev.inventory, item]
          : prev.inventory,
    }));

    addLog(`Purchased ${item.name}!`, 'victory');
  };

  // Equipar item
  const handleEquipItem = (item: Item) => {
    let newHero = gameState.hero;
    let newEquipped = { ...gameState.equippedItems };

    // Remover efeito do item anterior
    if (item.type === 'weapon' && newEquipped.weapon) {
      newHero = applyItemEffect(newHero, {
        attack: -(newEquipped.weapon.effect.attack || 0),
        critChance: -(newEquipped.weapon.effect.critChance || 0),
      });
    } else if (item.type === 'armor' && newEquipped.armor) {
      newHero = applyItemEffect(newHero, {
        defense: -(newEquipped.armor.effect.defense || 0),
        hp: -(newEquipped.armor.effect.hp || 0),
      });
    }

    // Aplicar efeito do novo item
    newHero = applyItemEffect(newHero, item.effect);

    // Atualizar equipado
    if (item.type === 'weapon') {
      newEquipped.weapon = item;
    } else if (item.type === 'armor') {
      newEquipped.armor = item;
    }

    setGameState((prev) => ({
      ...prev,
      hero: newHero,
      equippedItems: newEquipped,
    }));

    addLog(`Equipped ${item.name}!`, 'victory');
  };

  // Reivindicar recompensa diária
  const handleClaimDailyReward = () => {
    if (!canClaimDailyReward(gameState.dailyRewards.lastClaimed)) {
      addLog('Already claimed today!', 'damage');
      return;
    }

    const newStreak = calculateStreak(gameState.dailyRewards.lastClaimed);
    const currentDay = Math.min(newStreak + gameState.dailyRewards.streak + 1, 7);
    const reward = DAILY_REWARDS[currentDay - 1];

    setGameState((prev) => ({
      ...prev,
      gold: prev.gold + reward.gold,
      gems: prev.gems + reward.gems,
      dailyRewards: {
        lastClaimed: new Date().toISOString(),
        streak: currentDay === 7 ? 0 : currentDay,
      },
    }));

    addLog(
      `Daily reward claimed! +${reward.gold} gold, +${reward.gems} gems`,
      'victory'
    );
    setShowDailyRewards(false);
  };

  // Lucky Spin (mini-game)
  const handleLuckySpin = () => {
    if (gameState.gems < 5) {
      addLog('Need 5 gems to spin!', 'damage');
      return;
    }

    const prizes = [
      { name: '💰 100 Gold', gold: 100, gems: 0, chance: 0.4 },
      { name: '💎 5 Gems', gold: 0, gems: 5, chance: 0.3 },
      { name: '💰 500 Gold', gold: 500, gems: 0, chance: 0.15 },
      { name: '💎 20 Gems', gold: 0, gems: 20, chance: 0.1 },
      { name: '🎁 JACKPOT!', gold: 2000, gems: 100, chance: 0.05 },
    ];

    const random = Math.random();
    let cumulative = 0;
    let prize = prizes[0];

    for (const p of prizes) {
      cumulative += p.chance;
      if (random <= cumulative) {
        prize = p;
        break;
      }
    }

    setGameState((prev) => ({
      ...prev,
      gems: prev.gems - 5 + prize.gems,
      gold: prev.gold + prize.gold,
    }));

    setSpinResult(prize.name);
    addLog(`Lucky Spin: ${prize.name}!`, 'victory');

    setTimeout(() => setSpinResult(null), 3000);
  };

  // Renderizar apenas após montagem para evitar hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  Hero's Quest
                </h1>
                <p className="text-purple-100 text-sm">Battle Legends</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="font-bold text-white">100</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="text-2xl">💎</span>
                <span className="font-bold text-white">10</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-white">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
                Hero's Quest
              </h1>
              <p className="text-purple-100 text-sm">Battle Legends</p>
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
            >
              {showMenu ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Currency Display */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-white">{gameState.gold}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="font-bold text-white">{gameState.gems}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="font-bold text-white">
                {gameState.stats.enemiesDefeated}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Buttons */}
        {showMenu && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => {
                setShowShop(true);
                setShowMenu(false);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop
            </button>
            <button
              onClick={() => {
                setShowDailyRewards(true);
                setShowMenu(false);
              }}
              className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              Daily
            </button>
            <button
              onClick={() => {
                setShowAchievements(true);
                setShowMenu(false);
              }}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              Achievements
            </button>
            <button
              onClick={handleLuckySpin}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Dices className="w-5 h-5" />
              Spin (5💎)
            </button>
          </div>
        )}
      </div>

      {/* Spin Result */}
      {spinResult && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-2xl px-8 py-4 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          {spinResult}
        </div>
      )}

      {/* Game UI */}
      <GameUI
        hero={gameState.hero}
        enemy={gameState.currentEnemy}
        battleLogs={battleLogs}
        onAttack={handleAttack}
        onHeal={handleHeal}
        isInBattle={gameState.currentEnemy !== null}
        autoAttackEnabled={autoAttackEnabled}
        onToggleAutoAttack={() => setAutoAttackEnabled(!autoAttackEnabled)}
      />

      {/* Shop Modal */}
      {showShop && (
        <Shop
          gold={gameState.gold}
          gems={gameState.gems}
          inventory={gameState.inventory}
          equippedItems={gameState.equippedItems}
          onBuyItem={handleBuyItem}
          onEquipItem={handleEquipItem}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* Daily Rewards Modal */}
      {showDailyRewards && (
        <DailyRewards
          streak={gameState.dailyRewards.streak}
          onClaim={handleClaimDailyReward}
          onClose={() => setShowDailyRewards(false)}
          canClaim={canClaimDailyReward(gameState.dailyRewards.lastClaimed)}
        />
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Achievements</h2>
              </div>
              <button
                onClick={() => setShowAchievements(false)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {gameState.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-xl p-4 ${
                    achievement.completed
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg ${
                          achievement.completed
                            ? 'text-white'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {achievement.completed ? '✓ ' : ''}
                        {achievement.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          achievement.completed
                            ? 'text-white/90'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {achievement.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-black/20 rounded-full h-2">
                          <div
                            className="bg-white h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                (achievement.current / achievement.requirement) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            achievement.completed
                              ? 'text-white'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {achievement.current}/{achievement.requirement}
                        </span>
                      </div>
                    </div>
                    {achievement.completed && (
                      <div className="ml-3 text-3xl">🏆</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
