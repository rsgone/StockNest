export const ICON_CATEGORIES = ['all', 'food', 'beverages', 'household']

export const ICONS = [
  // Grains & staples
  { key: 'rice', emoji: '🍚', category: 'food' },
  { key: 'flour', emoji: '🌾', category: 'food' },
  { key: 'pulses', emoji: '🫘', category: 'food' },
  { key: 'bread', emoji: '🍞', category: 'food' },
  // Dairy & eggs
  { key: 'ghee', emoji: '🧈', category: 'food' },
  { key: 'curd', emoji: '🥣', category: 'food' },
  { key: 'eggs', emoji: '🥚', category: 'food' },
  { key: 'breakfast', emoji: '🥞', category: 'food' },
  // Cooking essentials
  { key: 'oil', emoji: '🫙', category: 'food' },
  { key: 'spices', emoji: '🌶️', category: 'food' },
  // Meat, produce, snacks
  { key: 'non_veg', emoji: '🍖', category: 'food' },
  { key: 'vegetables', emoji: '🥦', category: 'food' },
  { key: 'fruits', emoji: '🍎', category: 'food' },
  { key: 'snacks', emoji: '🍿', category: 'food' },
  { key: 'chocolates', emoji: '🍫', category: 'food' },
  { key: 'groceries', emoji: '🛒', category: 'food' },
  // Beverages
  { key: 'milk', emoji: '🥛', category: 'beverages' },
  { key: 'tea', emoji: '☕', category: 'beverages' },
  { key: 'cooldrinks', emoji: '🥤', category: 'beverages' },
  { key: 'alcohol', emoji: '🍾', category: 'beverages' },
  // Personal care & cleaning
  { key: 'soap', emoji: '🧼', category: 'household' },
  { key: 'personal_care', emoji: '🧴', category: 'household' },
  { key: 'baby', emoji: '🍼', category: 'household' },
  { key: 'cleaning', emoji: '🧽', category: 'household' },
  // Pooja
  { key: 'flowers', emoji: '💐', category: 'household' },
  { key: 'temple', emoji: '🛕', category: 'household' },
  // Other household
  { key: 'electronics', emoji: '🔌', category: 'household' },
  { key: 'utilities', emoji: '🔧', category: 'household' },
  { key: 'medicine', emoji: '💊', category: 'household' },
  { key: 'books', emoji: '📚', category: 'household' },
  { key: 'home_goods', emoji: '🛋️', category: 'household' },
  { key: 'vehicle', emoji: '🚗', category: 'household' },
]

export const DEFAULT_ICON = { key: 'default', emoji: '📦' }

export function getIcon(key) {
  return ICONS.find((i) => i.key === key) || DEFAULT_ICON
}

// The item's category is just its icon's name — there's no separate category
// concept anymore. Items created before this change stored an independent
// category value (e.g. "grains", or older plain-English strings like
// "Grains"); translate known icon keys, falling back to whatever was stored
// so old items keep displaying correctly.
export function categoryLabel(category, t) {
  const code = category?.toLowerCase?.().replace(/\s+/g, '_')
  const key = `icon.${code}`
  const translated = t(key)
  return translated === key ? category : translated
}
