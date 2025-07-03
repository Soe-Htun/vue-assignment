<template>
  <div class="casino-app">
    <div class="category-bar">
      <div class="category-container">
        <div
          v-for="category in categories"
          :key="category"
          :class="{ 'category-item': true, active: activeCategory === category }"
          @click="activeCategory = category"
        >
          {{ category }}
        </div>
      </div>
    </div>

    <div class="game-container">
      <LoadingSpinner v-if="loading" text="Loading games..." />

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else class="game-grid">
        <div
          v-for="game in filteredGames"
          :key="game.id"
          class="game-card"
          @mouseenter="hoveredGame = game.id"
          @mouseleave="hoveredGame = null"
        >
          <div class="game-image-wrapper">
            <img
              :src="game.image"
              :alt="game.name"
              class="game-thumbnail"
              @error="handleImageError"
            />

            <div v-if="hoveredGame === game.id" class="game-overlay">
              <button class="play-button">
                PLAY NOW
                <span v-if="jackpots[game.id]" class="jackpot-badge">
                  £{{ formatJackpot(jackpots[game.id]) }}
                </span>
              </button>
            </div>
          </div>

          <!-- <div class="game-info">
            <h3 class="game-title">{{ game.name }}</h3>
          </div> -->

          <!-- Ribbon -->
          <div v-if="game.categories.includes('new')" class="ribbon new"><span>NEW</span></div>
          <div v-if="game.categories.includes('top')" class="ribbon top"><span>TOP</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import LoadingSpinner from '../components/ui/loading.vue'

const categories = ref([
  'Top Games',
  'New Games',
  'Slots',
  'Jackpots',
  'Live',
  'Blackjack',
  'Roulette',
  'Table',
  'Poker',
  'Other',
])

const activeCategory = ref('Top Games')
const games = ref([])
const jackpots = ref({})
const hoveredGame = ref(null)
const loading = ref(true)
const error = ref(null)

const formatJackpot = (amount) => {
  return amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0'
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300x300?text=Game+Image'
}

const fetchGames = async () => {
  try {
    loading.value = true
    const res = await fetch('http://stage.whgstage.com/front-end-test/games.php')
    const data = await res.json()
    games.value = Object.values(data)
  } catch (err) {
    error.value = 'Failed to load games. Please try again later.'
    console.error('Error fetching games:', err)
  } finally {
    loading.value = false
  }
}

const fetchJackpots = async () => {
  try {
    const res = await fetch('http://stage.whgstage.com/front-end-test/jackpots.php')
    const data = await res.json()
    jackpots.value = {}
    data.forEach((j) => {
      jackpots.value[j.game] = j.amount
    })
  } catch (err) {
    console.error('Error fetching jackpots:', err)
  }
}

onMounted(() => {
  fetchGames()
  fetchJackpots()
  const jackpotInterval = setInterval(fetchJackpots, 5000)

  // Cleanup interval on component unmount
  onUnmounted(() => clearInterval(jackpotInterval))
})

const filteredGames = computed(() => {
  if (!games.value.length) return []

  switch (activeCategory.value) {
    case 'Top Games':
      return games.value.filter((game) => game.categories?.includes('top'))
    case 'New Games':
      return games.value.filter((game) => game.categories?.includes('new'))
    case 'Jackpots':
      return games.value.filter((game) => jackpots.value[game.id])
    case 'Other':
      return games.value.filter(
        (game) =>
          !['top', 'new', 'slots', 'live', 'blackjack', 'roulette', 'table', 'poker'].some((cat) =>
            game.categories?.includes(cat),
          ),
      )
    default:
      return games.value.filter((game) =>
        game.categories?.includes(activeCategory.value.toLowerCase()),
      )
  }
})
</script>

<style scoped>
.casino-app {
  font-family: 'Arial', sans-serif;
  background: var(--bg-secondary);
  min-height: 100vh;
  color: white;
  margin: 0;
  padding: 0;
}

.category-bar {
  width: 100%;
  background: var(--bg-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.category-container {
  display: flex;
  overflow-x: auto;
  margin: 0 auto;
  scrollbar-width: none;
  font-size: 16px;
}
.category-container::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome/Safari */
}

.category-item {
  padding: 16px 24px;
  white-space: nowrap;
  cursor: pointer;
  /* background: #3a3a5a; */
  color: var(--bg-secondary);
  font-weight: 600;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
}

.category-item.active {
  background: var(--primary-color);
  color: white;
}

/* .category-item:hover {
  background: #4a4a6a;
} */

/* Game Grid */
.game-container {
  width: 100%;
  margin: 0 auto;
  padding: 50px 100px;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 40px 20px;
}

.game-card {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  background: var(--bg-primary);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.game-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.game-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* object-fit: cover;
  object-position: center; */
  transition: transform 0.3s ease;
}

.game-card:hover .game-thumbnail {
  transform: scale(1.05);
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover .game-overlay {
  opacity: 1;
}

.play-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: background 0.3s ease;
}

.play-button:hover {
  background: #7cb532;
}

.jackpot-badge {
  background: rgba(0, 0, 0, 0.5);
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  color: #f8d35b;
}

.game-info {
  padding: 15px;
}

.game-title {
  margin: 0;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ribbon {
  position: absolute;
  right: -5px;
  top: -6px;
  z-index: 1;
  overflow: hidden;
  width: 100px;
  height: 100px;
}
.ribbon span {
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  text-transform: uppercase;
  text-align: center;
  line-height: 27px;
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  width: 100px;
  position: absolute;
  top: 17px;
  right: -20px;
}
.ribbon span::before,
.ribbon span::after {
  content: '';
  position: absolute;
  top: 100%;
  z-index: -1;
  border-bottom: 3px solid transparent;
  border-top: 3px solid;
}

.ribbon span::before {
  left: -0px;
  border-left: 3px solid;
  border-right: 3px solid transparent;
}

.ribbon span::after {
  right: 0px;
  border-left: 3px solid transparent;
  border-right: 3px solid;
}

.ribbon.new span {
  background: var(--success);
  background: linear-gradient(#5a911f 0%, var(--success) 100%);
}

.ribbon.new span::before {
  border-left-color: var(--success);
  border-top-color: var(--success);
}

.ribbon.new span::after {
  border-right-color: var(--success);
  border-top-color: var(--success);
}

.ribbon.top span {
  background: #e74c3c;
  background: linear-gradient(#ff6656 0%, #e74c3c 100%);
}

.ribbon.top span::before {
  border-left-color: #e74c3c;
  border-top-color: #e74c3c;
}

.ribbon.top span::after {
  border-right-color: #e74c3c;
  border-top-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.category-container::-webkit-scrollbar {
  height: 6px;
}

.category-container::-webkit-scrollbar-track {
  background: transparent;
}

.category-container::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}
</style>
