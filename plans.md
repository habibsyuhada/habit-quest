# Farming Game — Replace Hero Page

## Context
User ingin menghapus halaman Hero (avatar customizer) dan menggantinya dengan game bertani sederhana. Asset tanaman sudah ada di `public/crop/` (11 jenis tanaman, masing-masing 6 stage gambar `_00` s/d `_05`). Mekanik game: klik tanah → pilih tanaman → tunggu tumbuh → panen saat stage 4. Panen memberi gold + XP.

## Data Layer

### 1. `lib/types.ts` — Tambah type baru
- `CropType` union: 11 nama tanaman
- `FarmPlot`: `{ id, crop, plantedAt, stage }`
- `FarmState`: `{ plots: FarmPlot[], totalHarvests: number }`
- Tambah `farm: FarmState` ke `GameState`
- Tambah action signatures ke `GameStore`: `plantCrop`, `harvestCrop`

### 2. `lib/constants.ts` — Definisi tanaman
- `CROP_DEFINITIONS: Record<CropType, { name, growthDuration, goldReward, xpReward, seedCost }>`
- Durasi: 30s (radish) sampai 300s (pumpkin)
- Seed cost < gold reward supaya selalu profit
- `FARM_CONFIG`: `INITIAL_PLOT_COUNT: 9`, `POLL_INTERVAL_MS: 1000`

### 3. `lib/game-mechanics.ts` — Helper functions
- `computeGrowthStage(plantedAt, growthDuration)` → stage 0-4 dari timestamp
- `getCropImagePath(crop, stage)` → `/crop/{crop}_{stage}.png`
- `createInitialFarm()` → 9 empty plots

### 4. `lib/store.ts` — Tambah farm state + actions
- `farm: createInitialFarm()` di initial state
- `plantCrop(plotId, crop)`: kurangi gold (seed cost), set crop + plantedAt
- `harvestCrop(plotId)`: tambah gold + XP, cek level up, reset plot ke empty
- Bump persist version 1 → 2, tambah migrate function untuk inject farm ke existing state

## UI Components (baru di `components/farm/`)

### 5. `FarmPlot.tsx` — Satu petak tanah
- Kosong: tampilkan "+" icon, klik buka CropSelector
- Tumbuh (stage 0-3): tampilkan gambar tanaman sesuai stage, progress indicator
- Siap panen (stage 4): gambar + animasi bounce/glow, klik untuk panen

### 6. `CropSelector.tsx` — Dialog pilih tanaman
- Grid kartu tanaman (pakai shadcn Dialog)
- Tiap kartu: gambar stage 4, nama, durasi, biaya, reward
- Tanaman yang tidak cukup gold di-dim

### 7. `HarvestAnimation.tsx` — Animasi panen
- Tampilkan gambar `_05` (buah) + teks "+X gold / +Y XP"
- Pakai framer-motion, auto-dismiss ~1.2 detik

### 8. `FarmGrid.tsx` — Grid 3x3 + polling
- `useEffect` + `setInterval` 1 detik untuk recompute stages
- Stage di-compute on-read dari timestamp (bukan di-store), jadi tidak ada store write tiap detik

## Page & Navigation

### 9. `app/farm/page.tsx` — Halaman farm baru
- Layout sama seperti TasksPage/Shop: StatsBar + header + FarmGrid
- Header: ikon Sprout + judul "Farm" + gold display

### 10. Hapus & update navigasi
- **DELETE** `app/avatar/page.tsx`
- **DELETE** `components/avatar/AvatarDisplay.tsx`
- **MODIFY** `components/layout/Header.tsx`: nav item `/avatar` "Hero" (User icon) → `/farm` "Farm" (Sprout icon)
- **MODIFY** `app/page.tsx`: quick action link `/avatar` "Hero" → `/farm` "Farm"

## Urutan Implementasi
1. Types → Constants → Game mechanics helpers → Store (data layer dulu)
2. FarmPlot → CropSelector → HarvestAnimation → FarmGrid (UI components)
3. Farm page → Hapus avatar → Update navigasi (integration)

## Verification
- Buka `/farm`, harus tampil 3x3 grid petak kosong
- Klik petak → pilih tanaman → gambar stage 0 muncul, gold berkurang
- Tunggu growth → stage berubah sesuai waktu, gambar berubah
- Saat stage 4 → animasi glow, klik untuk panen
- Panen → animasi buah + reward, gold/XP bertambah, plot kosong lagi
- Cek mobile & desktop responsive
