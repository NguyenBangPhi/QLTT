<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  HardDriveDownload,
  HardDriveUpload,
  TriangleAlert,
  Upload,
} from 'lucide-vue-next'

definePageMeta({ layout: 'admin', roles: ['Admin'] })
useHead({ title: 'Sao lưu & dữ liệu · Quản trị thư viện' })

const { backup, exportData, restore, importBooks } = useDataTransfer()

const restoreFile = ref<File | null>(null)
const importFile = ref<File | null>(null)
const confirmRestore = ref(false)

function runRestore() {
  if (!restoreFile.value) return
  confirmRestore.value = false
  restore.mutate(restoreFile.value, { onSuccess: () => (restoreFile.value = null) })
}

function runImport() {
  if (!importFile.value) return
  importBooks.mutate(importFile.value, { onSuccess: () => (importFile.value = null) })
}
</script>

<template>
  <div>
    <CommonPageHeader
      title="Sao lưu & dữ liệu"
      description="Sao lưu toàn bộ database, phục hồi từ file .sql, xuất và nhập dữ liệu bằng Excel"
    />

    <div class="grid gap-4 lg:grid-cols-2">
      <UiCard class="flex flex-col p-5">
        <div class="flex items-center gap-2 font-semibold">
          <HardDriveDownload class="size-4" aria-hidden="true" />
          Sao lưu database
        </div>
        <p class="mt-1 mb-4 text-sm text-muted-foreground">
          Tải về một file <code class="font-mono text-xs">.sql</code> chứa toàn bộ bảng, dữ liệu,
          view, stored procedure, function và trigger.
        </p>
        <div class="mt-auto">
          <UiButton :loading="backup.isPending.value" @click="backup.mutate()">
            <Download v-if="!backup.isPending.value" aria-hidden="true" />
            Tải file sao lưu
          </UiButton>
        </div>
      </UiCard>

      <UiCard class="flex flex-col border-danger-soft p-5">
        <div class="flex items-center gap-2 font-semibold">
          <HardDriveUpload class="size-4" aria-hidden="true" />
          Phục hồi database
        </div>
        <p class="mt-1 text-sm text-muted-foreground">
          Chạy file <code class="font-mono text-xs">.sql</code> lên database hiện tại.
        </p>

        <div
          class="mt-3 flex gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-soft-foreground"
        >
          <TriangleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Toàn bộ dữ liệu hiện tại sẽ bị ghi đè và không khôi phục lại được.</span>
        </div>

        <div class="mt-4 mb-3">
          <UiFileInput
            v-model="restoreFile"
            accept=".sql"
            :disabled="restore.isPending.value"
          />
        </div>

        <div class="mt-auto">
          <UiButton
            variant="destructive"
            :disabled="!restoreFile"
            :loading="restore.isPending.value"
            @click="confirmRestore = true"
          >
            <Upload v-if="!restore.isPending.value" aria-hidden="true" />
            Phục hồi
          </UiButton>
        </div>
      </UiCard>

      <UiCard class="flex flex-col p-5">
        <div class="flex items-center gap-2 font-semibold">
          <FileSpreadsheet class="size-4" aria-hidden="true" />
          Xuất dữ liệu ra Excel
        </div>
        <p class="mt-1 mb-4 text-sm text-muted-foreground">
          Bốn sheet: Sach, SinhVien, NguoiDung, TheLoai. Cột mật khẩu không được xuất.
        </p>
        <div class="mt-auto">
          <UiButton
            variant="outline"
            :loading="exportData.isPending.value"
            @click="exportData.mutate()"
          >
            <Download v-if="!exportData.isPending.value" aria-hidden="true" />
            Tải file Excel
          </UiButton>
        </div>
      </UiCard>

      <UiCard class="flex flex-col p-5">
        <div class="flex items-center gap-2 font-semibold">
          <Upload class="size-4" aria-hidden="true" />
          Nhập sách từ Excel
        </div>
        <p class="mt-1 text-sm text-muted-foreground">
          Chỉ đọc sheet <strong>Sach</strong>, cần đủ các cột ISBN, TenSach, MaTacGia, MaTheLoai,
          SoLuongTong. Các sheet khác được bỏ qua.
        </p>

        <div class="mt-4 mb-3">
          <UiFileInput
            v-model="importFile"
            accept=".xlsx"
            :disabled="importBooks.isPending.value"
          />
        </div>

        <div>
          <UiButton
            variant="outline"
            :disabled="!importFile"
            :loading="importBooks.isPending.value"
            @click="runImport"
          >
            <Upload v-if="!importBooks.isPending.value" aria-hidden="true" />
            Nhập dữ liệu
          </UiButton>
        </div>

        <div v-if="importBooks.data.value" class="mt-4 rounded-lg border p-3 text-sm">
          <div class="flex flex-wrap gap-4">
            <span>
              Nhập được
              <strong class="text-success-soft-foreground">
                {{ importBooks.data.value.imported }}
              </strong>
              sách
            </span>
            <span v-if="importBooks.data.value.skipped">
              Bỏ qua
              <strong class="text-danger-soft-foreground">
                {{ importBooks.data.value.skipped }}
              </strong>
              dòng
            </span>
          </div>

          <ul
            v-if="importBooks.data.value.errors.length"
            class="mt-2 max-h-48 space-y-1 overflow-y-auto border-t pt-2 text-xs text-muted-foreground"
          >
            <li v-for="(line, i) in importBooks.data.value.errors" :key="i">{{ line }}</li>
          </ul>
        </div>
      </UiCard>
    </div>

    <UiDialog
      v-model:open="confirmRestore"
      title="Phục hồi database?"
      description="Thao tác này không thể hoàn tác."
    >
      <p class="text-sm">
        Toàn bộ sách, sinh viên, phiếu mượn và nhật ký hiện tại sẽ bị thay thế bằng nội dung của
        file
        <strong class="font-mono">{{ restoreFile?.name }}</strong
        >.
      </p>
      <p class="mt-3 text-sm text-muted-foreground">
        Nên bấm <strong>Tải file sao lưu</strong> trước để còn đường quay lại.
      </p>

      <template #footer>
        <UiButton variant="ghost" @click="confirmRestore = false">Huỷ</UiButton>
        <UiButton variant="destructive" :loading="restore.isPending.value" @click="runRestore">
          Phục hồi
        </UiButton>
      </template>
    </UiDialog>
  </div>
</template>
