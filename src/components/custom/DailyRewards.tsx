'use client';

import { DAILY_REWARDS } from '@/lib/gameData';
import { Gift, X, Calendar, Flame } from 'lucide-react';

interface DailyRewardsProps {
  streak: number;
  onClaim: () => void;
  onClose: () => void;
  canClaim: boolean;
}

export default function DailyRewards({
  streak,
  onClaim,
  onClose,
  canClaim,
}: DailyRewardsProps) {
  const currentDay = Math.min(streak + 1, 7);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Rewards</h2>
              <p className="text-orange-100 text-sm flex items-center gap-1">
                <Flame className="w-4 h-4" />
                {streak} day streak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Rewards Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DAILY_REWARDS.map((reward) => {
              const isCurrent = reward.day === currentDay;
              const isClaimed = reward.day < currentDay;
              const isLocked = reward.day > currentDay;

              return (
                <div
                  key={reward.day}
                  className={`relative rounded-xl p-4 transition-all duration-200 ${
                    isCurrent
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg scale-105 ring-4 ring-yellow-300'
                      : isClaimed
                      ? 'bg-gray-200 dark:bg-gray-700 opacity-60'
                      : 'bg-gradient-to-br from-purple-400 to-pink-500'
                  }`}
                >
                  {/* Day Badge */}
                  <div className="absolute -top-2 -left-2 bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                    {isClaimed ? '✓' : reward.day}
                  </div>

                  {/* Rewards */}
                  <div className="text-center space-y-2 mt-2">
                    <div className="text-2xl">
                      {reward.day === 7 ? '🎁' : '💰'}
                    </div>
                    <div className="space-y-1">
                      <div className="text-white font-bold text-sm">
                        {reward.gold} Gold
                      </div>
                      <div className="text-white font-bold text-sm">
                        {reward.gems} Gems
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  {isCurrent && canClaim && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                      <span className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        CLAIM NOW!
                      </span>
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                      <span className="text-2xl">🔒</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Claim Button */}
          {canClaim ? (
            <button
              onClick={onClaim}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              Claim Day {currentDay} Reward!
            </button>
          ) : (
            <div className="w-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold py-4 px-6 rounded-xl text-center flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Come back tomorrow for more rewards!
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
            <p className="font-bold mb-1">💡 Pro Tip:</p>
            <p>
              Login daily to maintain your streak! Day 7 gives the biggest
              reward. Missing a day resets your streak to 0.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
