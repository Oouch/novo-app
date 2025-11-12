'use client';

import { Item } from '@/app/game/types';
import { SHOP_ITEMS } from '@/lib/gameData';
import { ShoppingBag, Coins, Gem, X } from 'lucide-react';

interface ShopProps {
  gold: number;
  gems: number;
  inventory: Item[];
  equippedItems: { weapon?: Item; armor?: Item };
  onBuyItem: (item: Item) => void;
  onEquipItem: (item: Item) => void;
  onClose: () => void;
}

export default function Shop({
  gold,
  gems,
  inventory,
  equippedItems,
  onBuyItem,
  onEquipItem,
  onClose,
}: ShopProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-500';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const canAfford = (item: Item) => {
    if (item.price.gold && gold < item.price.gold) return false;
    if (item.price.gems && gems < item.price.gems) return false;
    return true;
  };

  const isOwned = (item: Item) => {
    return inventory.some((i) => i.id === item.id);
  };

  const isEquipped = (item: Item) => {
    return (
      equippedItems.weapon?.id === item.id ||
      equippedItems.armor?.id === item.id
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Item Shop</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Currency Display */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 flex gap-4 justify-center">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {gold}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow">
            <Gem className="w-5 h-5 text-cyan-500" />
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {gems}
            </span>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHOP_ITEMS.map((item) => {
              const owned = isOwned(item);
              const equipped = isEquipped(item);
              const affordable = canAfford(item);

              return (
                <div
                  key={item.id}
                  className={`bg-gradient-to-br ${getRarityColor(
                    item.rarity
                  )} rounded-xl p-4 shadow-lg transition-all duration-200 hover:scale-105 ${
                    !affordable && !owned ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl">{item.icon}</div>
                    <div className="bg-white/20 px-2 py-1 rounded text-xs font-bold text-white uppercase">
                      {item.rarity}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-lg mb-1">
                    {item.name}
                  </h3>
                  <p className="text-white/90 text-sm mb-3">
                    {item.description}
                  </p>

                  {/* Effects */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.effect.attack && (
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                        ⚔️ +{item.effect.attack}
                      </span>
                    )}
                    {item.effect.defense && (
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                        🛡️ +{item.effect.defense}
                      </span>
                    )}
                    {item.effect.hp && (
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                        ❤️ +{item.effect.hp}
                      </span>
                    )}
                    {item.effect.critChance && (
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                        ⚡ +{(item.effect.critChance * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  {equipped ? (
                    <div className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-center">
                      ✓ Equipped
                    </div>
                  ) : owned ? (
                    <button
                      onClick={() => onEquipItem(item)}
                      className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyItem(item)}
                      disabled={!affordable}
                      className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {item.price.gold && (
                        <>
                          <Coins className="w-4 h-4" />
                          {item.price.gold}
                        </>
                      )}
                      {item.price.gems && (
                        <>
                          <Gem className="w-4 h-4" />
                          {item.price.gems}
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
