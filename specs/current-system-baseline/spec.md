# Feature Specification: Current System Baseline

## Objective
Mendokumentasikan perilaku aktual aplikasi Habit Quest yang sudah berjalan saat ini sebagai source of truth untuk pengembangan berikutnya.

## Context
Aplikasi adalah habit tracker bergaya RPG berbasis Next.js + Zustand dengan data persisten di localStorage (`habit-quest-storage`, versi 4). Fitur utama mencakup task management (habit/daily/todo), progression (XP, level, health, mana, gold), reward shop, dan farm mini-game.

## Business Rules
1. User default dibuat otomatis saat state awal: level 1, XP 0, health 50/50, mana 10/50, gold 0.
2. Reward task mengikuti difficulty tetap:
   - very_easy: +3 XP, +1 gold
   - easy: +5 XP, +2 gold
   - medium: +10 XP, +5 gold
   - hard: +15 XP, +10 gold
   - very_hard: +20 XP, +15 gold
3. Level-up terjadi saat total XP >= kebutuhan level berikutnya (`floor(50 * 1.2^(level-1))` untuk nilai level terkait).
4. Saat level-up: health dipulihkan penuh, max mana +5, mana diset ke max mana baru, semua stat +1.
5. Saat health mencapai 0: user "mati", kehilangan 50% gold (dibulatkan ke bawah), turun 1 level (minimum level 1), lalu health dipulihkan ke max.
6. Daily streak milestone tiap kelipatan 7 memberi +1 health (maksimal maxHealth).
7. Daily check harian dapat memberi penalti -1 health dan reset streak bila daily terlewat pada hari repeat yang relevan.
8. Reward hanya bisa dibeli bila belum dimiliki dan gold cukup.
9. Equip item hanya bisa untuk item owned, dan akan unequip item lain di kategori yang sama.
10. Farm hanya bisa ditanam di tile dirt yang kosong, dengan biaya seed sesuai crop.
11. Panen hanya valid saat crop matang penuh (stage 5), lalu memberi gold+XP dan menambah inventory crop.

## Functional Requirements
### FR-1 Dashboard
1. Sistem menampilkan stats bar (health, level progress, mana, gold) pada halaman utama.
2. Sistem menampilkan ringkasan jumlah habit, daily, dan rasio todo selesai.
3. Sistem memicu `checkDailies()` saat dashboard dibuka.

### FR-2 Task Management
1. User dapat membuat task tipe `habit`, `daily`, atau `todo` dengan title, description opsional, difficulty, dan tags.
2. Untuk habit, user dapat memilih `habitType` (`positive`, `negative`, `both`).
3. Untuk daily, user dapat memilih repeat day mingguan dan sistem menyimpan streak/completedToday.
4. User dapat edit dan delete task existing.
5. Task list dapat difilter berdasarkan tag.
6. User dapat menyelesaikan task:
   - Todo: set `completed=true` dan `completedDate`.
   - Daily: set `completedToday=true`, update streak, simpan `lastCompleted`.
   - Habit: aksi `positive` memberi reward, aksi `negative` memberi damage.
7. Validasi habit action:
   - Habit `positive` menolak aksi negative.
   - Habit `negative` menolak aksi positive.

### FR-3 Reward Shop
1. Sistem menginisialisasi default rewards jika daftar reward masih kosong.
2. User dapat melihat reward per tab: equipment, potions, custom.
3. User dapat membuat custom reward (name wajib, cost numerik wajib, description opsional).
4. User dapat membeli reward jika syarat terpenuhi (gold cukup, belum owned).

### FR-4 Farm
1. Sistem menyediakan world 48x48 dengan area dirt terpusat 46x46 sebagai lahan tanam.
2. User dapat memilih seed dari daftar crop dan menanam pada plot valid.
3. Sistem menghitung growth stage berbasis waktu tanam dan growth duration crop.
4. User dapat memanen crop matang untuk mendapatkan gold, XP, dan item inventory.
5. Sistem menampilkan inventory hasil panen per jenis crop.

### FR-5 Persistence and Migration
1. Seluruh game state dipersist ke localStorage menggunakan Zustand persist.
2. Sistem menjalankan migrasi state:
   - versi < 3: inisialisasi farm
   - versi < 4: inisialisasi inventory

## Non-Functional Requirements
1. Arsitektur state menggunakan single client-side store (`useGameStore`) dengan aksi immutable update.
2. UI berjalan di client components untuk interaksi realtime.
3. Antarmuka responsif untuk mobile dan desktop (dashboard/task/shop).
4. Operasi game utama tidak memerlukan backend.
5. Test otomatis tersedia untuk unit logic, store, komponen task, dan workflow integrasi.

## Acceptance Criteria
1. Membuat todo difficulty `medium` lalu complete menambah user menjadi +10 XP dan +5 gold.
2. Daily yang diselesaikan menaikkan `streak` minimal +1 dan menandai `completedToday=true`.
3. Habit positive memberi reward sesuai difficulty, habit negative mengurangi health 1 poin.
4. Saat health turun ke 0, user kehilangan 50% gold, turun 1 level (min 1), dan health reset ke max.
5. Level-up memulihkan health/mana, menambah max mana +5, dan menaikkan semua stat +1.
6. Reward tidak dapat dibeli jika gold kurang; jika cukup maka gold berkurang dan reward menjadi owned.
7. Menanam crop memotong gold sesuai seed cost dan menyimpan `plantedAt`.
8. Panen crop matang menambah gold, XP, inventory crop, dan mengosongkan plot.
9. Data state tetap tersedia setelah reload browser via localStorage persist.
10. Filter tag di halaman task hanya menampilkan task yang memiliki tag terpilih.

## Error Cases
1. Submit create/edit task dengan title kosong: task tidak disimpan.
2. Complete/update/delete task dengan id tidak ditemukan: state tidak berubah.
3. Habit action yang tidak cocok dengan `habitType`: diabaikan tanpa perubahan state.
4. Purchase reward yang tidak valid (id tidak ada/sudah owned/gold kurang): state tidak berubah.
5. Plant crop di luar dirt, plot terisi, atau gold tidak cukup: state tidak berubah.
6. Harvest crop yang belum matang/tidak ada crop: state tidak berubah.

## Out of Scope
1. Sinkronisasi multi-device atau backend persistence.
2. Sistem party/guild/social.
3. Combat system, quest narrative, atau battle loop.
4. Avatar editor penuh dan equipment visual rendering ke avatar.
5. Mekanik konsumsi potion yang mempengaruhi stats saat ini.
6. Notifikasi real-time lintas perangkat.

## Notes on Current Behavior (Known Baseline)
1. `Task.value` saat create/edit saat ini tidak dipakai sebagai multiplier reward; nilai diset ke `1` pada submit.
2. Todo yang sudah completed masih bisa memicu `completeTask(id)` dari layer store dan tetap memberi reward lagi bila dipanggil ulang.
3. `computeGrowthStage` membatasi nilai maksimum ke stage `4`, sementara proses panen mengecek `stage >= 5`; ini menyebabkan panen tidak tercapai tanpa penyesuaian state eksternal/testing.
4. Halaman farm mengharuskan mode fullscreen sebelum gameplay utama ditampilkan.
