# Tasks - Current System Baseline

## Objective
Menjaga implementasi tetap selaras dengan baseline behavior yang sudah didokumentasikan.

## Tasks
1. Validasi semua acceptance criteria pada `spec.md` terhadap test suite yang ada.
2. Tandai perbedaan antara behavior aktual dan behavior yang diinginkan produk (jika ada) sebagai change request terpisah.
3. Prioritaskan perbaikan untuk known baseline issues:
   - Panen farm tidak tercapai karena mismatch growth stage.
   - Reward todo bisa didapat berulang dari pemanggilan store langsung.
   - `Task.value` belum mempengaruhi reward.
4. Pastikan setiap perubahan perilaku di masa depan didahului update spec terlebih dahulu.

## Traceability Matrix (Baseline)
1. Task completion rewards -> `__tests__/integration/task-workflow.test.ts`.
2. Leveling/death/game mechanics -> `__tests__/unit/lib/game-mechanics.test.ts`, `__tests__/unit/store/store.test.ts`.
3. Task UI behavior (habit/daily/todo/tag) -> `__tests__/unit/components/task/TaskCard.test.tsx`, `__tests__/unit/components/task/TagInput.test.tsx`.
4. Reward purchase/equip -> `__tests__/unit/store/store.test.ts`.
5. Farm inventory update path -> `__tests__/unit/store/store.test.ts` (bagian farm inventory).
