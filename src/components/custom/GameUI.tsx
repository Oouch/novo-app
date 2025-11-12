'use client';

import { Hero, Enemy, BattleLog } from '@/app/game/types';
import { Shield, Swords, Heart, Zap, Trophy, Skull } from 'lucide-react';

interface GameUIProps {
  hero: Hero;
  enemy: Enemy | null;
  battleLogs: BattleLog[];
  onAttack: () => void;
  onHeal: () => void;
  isInBattle: boolean;
  autoAttackEnabled: boolean;
  onToggleAutoAttack: () => void;
}

export default function GameUI({
  hero,
  enemy,
  battleLogs,
  onAttack,
  onHeal,
  isInBattle,
  autoAttackEnabled,
  onToggleAutoAttack,
}: GameUIProps) {
  const heroHpPercent = (hero.hp / hero.maxHp) * 100;
  const enemyHpPercent = enemy ? (enemy.hp / enemy.maxHp) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Hero Stats Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{hero.avatar}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{hero.name}</h2>
              <p className="text-blue-100">Level {hero.level}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-white mb-1">
              <Swords className="w-5 h-5" />
              <span className="font-bold">{hero.attack}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5" />
              <span className="font-bold">{hero.defense}</span>
            </div>
          </div>
        </div>

        {/* HP Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              HP
            </span>
            <span className="font-bold">
              {hero.hp} / {hero.maxHp}
            </span>
          </div>
          <div className="h-4 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${heroHpPercent}%` }}
            />
          </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-2 mt-3">
          <div className="flex justify-between text-sm text-white">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              XP
            </span>
            <span className="font-bold">
              {hero.xp} / {hero.xpToNextLevel}
            </span>
          </div>
          <div className="h-3 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
              style={{ width: `${(hero.xp / hero.xpToNextLevel) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Battle Arena */}
      {enemy && (
        <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {enemy.isBoss && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-red-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
              <Trophy className="w-3 h-3" />
              BOSS
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{enemy.avatar}</div>
              <div>
                <h3 className="text-2xl font-bold text-white">{enemy.name}</h3>
                <p className="text-red-100">Level {enemy.level}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-white mb-1">
                <Skull className="w-5 h-5" />
                <span className="font-bold">{enemy.attack}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5" />
                <span className="font-bold">{enemy.defense}</span>
              </div>
            </div>
          </div>

          {/* Enemy HP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                HP
              </span>
              <span className="font-bold">
                {enemy.hp} / {enemy.maxHp}
              </span>
            </div>
            <div className="h-4 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-400 to-pink-500 transition-all duration-300"
                style={{ width: `${enemyHpPercent}%` }}
              />
            </div>
          </div>

          {/* Reward Preview */}
          <div className="mt-3 flex gap-2 text-sm text-white">
            <span className="bg-black/30 px-3 py-1 rounded-full">
              💰 {enemy.reward.gold}
            </span>
            <span className="bg-black/30 px-3 py-1 rounded-full">
              ⭐ {enemy.reward.xp} XP
            </span>
            {enemy.reward.gems && (
              <span className="bg-black/30 px-3 py-1 rounded-full">
                💎 {enemy.reward.gems}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Battle Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAttack}
          disabled={!isInBattle || hero.hp <= 0}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Swords className="w-5 h-5" />
          {isInBattle ? 'ATTACK!' : 'Find Enemy'}
        </button>

        <button
          onClick={onHeal}
          disabled={hero.hp >= hero.maxHp}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Heart className="w-5 h-5" />
          Heal (50g)
        </button>
      </div>

      {/* Auto Attack Toggle */}
      <button
        onClick={onToggleAutoAttack}
        className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 ${
          autoAttackEnabled
            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {autoAttackEnabled ? '⚡ Auto-Attack ON' : '⚡ Auto-Attack OFF'}
      </button>

      {/* Battle Log */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg max-h-48 overflow-y-auto">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Battle Log
        </h3>
        <div className="space-y-1">
          {battleLogs.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No battles yet...</p>
          ) : (
            battleLogs.slice(-8).reverse().map((log) => (
              <div
                key={log.id}
                className={`text-sm p-2 rounded ${
                  log.type === 'critical'
                    ? 'bg-yellow-100 text-yellow-900 font-bold'
                    : log.type === 'victory'
                    ? 'bg-green-100 text-green-900 font-bold'
                    : log.type === 'levelup'
                    ? 'bg-purple-100 text-purple-900 font-bold'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
