<template>
  <div class="casino-app">
    <!-- Category Navigation Bar -->
    <div class="category-bar">
      <div class="category-scroller">
        <div
          v-for="category in categories"
          :key="category"
          :class="{ 'category-item': true, 'active': activeCategory === category }"
          @click="activeCategory = category"
        >
          {{ category }}
        </div>
      </div>
    </div>

    <!-- Game Grid -->
    <div class="game-container">
      <!-- <div v-if="loading" class="loading-spinner">
        Loading games...
      </div> -->
       <LoadingSpinner 
            v-if="loading"
            text="Loading games..."
        />
      
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
            
            <!-- Hover Overlay -->
            <div 
              v-if="hoveredGame === game.id"
              class="game-overlay"
            >
              <button class="play-button">
                PLAY NOW
                <span v-if="jackpots[game.id]" class="jackpot-badge">
                  £{{ formatJackpot(jackpots[game.id]) }}
                </span>
              </button>
            </div>
          </div>

          <div class="game-info">
            <h3 class="game-title">{{ game.name }}</h3>
          </div>

          <!-- Ribbon Badges -->
          <div 
            v-if="game.categories.includes('new')" 
            class="game-badge new"
          >
            NEW
          </div>
          <div 
            v-if="game.categories.includes('top')" 
            class="game-badge top"
          >
            TOP
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import LoadingSpinner from './ui/loading.vue'

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
  'Other'
])

const activeCategory = ref('Top Games')
const games = ref([])
const jackpots = ref({})
const hoveredGame = ref(null)
const loading = ref(true)
const error = ref(null)

// Format jackpot amount with commas
const formatJackpot = (amount) => {
  return amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'
}

// Handle broken images
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300x300?text=Game+Image'
}

const fetchGames = async () => {
  try {
    loading.value = true
    const res = await fetch('http://stage.whgstage.com/front-end-test/games.php')
    const data = await res.json()
    games.value = Object.values(data) // Convert to array if needed
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
    data.forEach(j => {
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
  
  switch(activeCategory.value) {
    case 'Top Games':
      return games.value.filter(game => game.categories?.includes('top'))
    case 'New Games':
      return games.value.filter(game => game.categories?.includes('new'))
    case 'Jackpots':
      return games.value.filter(game => jackpots.value[game.id])
    case 'Other':
      return games.value.filter(game => 
        !['top', 'new', 'slots', 'live', 'blackjack', 'roulette', 'table', 'poker']
          .some(cat => game.categories?.includes(cat)))
    default:
      return games.value.filter(game => 
        game.categories?.includes(activeCategory.value.toLowerCase()))
  }
})
</script>

<style scoped>
.casino-app {
  font-family: 'Arial', sans-serif;
  background: #1a1a2e;
  min-height: 100vh;
  color: white;
  padding: 20px;
}

/* Category Navigation */
.category-bar {
  background: #2d2d42;
  padding: 15px 0;
  margin-bottom: 30px;
  border-radius: 8px;
}

.category-scroller {
  display: flex;
  overflow-x: auto;
  padding: 0 15px;
  gap: 12px;
  scrollbar-width: thin;
}

.category-item {
  padding: 8px 20px;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 20px;
  background: #3a3a5a;
  color: #b8b8d1;
  font-weight: 600;
  transition: all 0.3s ease;
}

.category-item.active {
  background: #8DC63F;
  color: white;
}

.category-item:hover {
  background: #4a4a6a;
}

/* Game Grid */
.game-container {
  max-width: 1200px;
  margin: 0 auto;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.game-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #2d2d42;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.game-image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Square aspect ratio */
  overflow: hidden;
}

.game-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  background: #8DC63F;
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

/* Badges */
.game-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.game-badge.new {
  background: #2ecc71;
}

.game-badge.top {
  background: #e74c3c;
}

/* Loading and Error States */
.loading-spinner {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.category-scroller::-webkit-scrollbar {
  height: 6px;
}

.category-scroller::-webkit-scrollbar-track {
  background: transparent;
}

.category-scroller::-webkit-scrollbar-thumb {
  background: #8DC63F;
  border-radius: 3px;
}
</style>