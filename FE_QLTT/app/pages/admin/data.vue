<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  HardDriveDownload,
  HardDriveUpload,
  Info,
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

    <div class="grid items-start gap-4 lg:grid-cols-2">
      <UiCard class="p-5">
        <div class="flex items-center gap-2 font-semibold">
          <HardDriveDownload class="size-4" aria-hidden="true" />
          Sao lưu database
        </div>
        <p class="mt-1 mb-4 text-sm text-muted-foreground">
          Tải về một file <code class="font-mono text-xs">.sql</code> chứa toàn bộ bảng, dữ liệu,
          view, stored procedure, function và trigger.
        </p>
        <UiButton :loading="backup.isPending.value" @click="backup.mutate()">
          <Download v-if="!backup.isPending.value" aria-hidden="true" />
          Tải file sao lưu
        </UiButton>
      </UiCard>

      <UiCard class="p-5">
        <div class="flex items-center gap-2 font-semibold">
          <FileSpreadsheet class="size-4" aria-hidden="true" />
          Xuất dữ liệu ra Excel
        </div>
        <p class="mt-1 mb-4 text-sm text-muted-foreground">
          Tải về toàn bộ thể loại và sách dưới dạng file
          <code class="font-mono text-xs">.xlsx</code>, mỗi bảng một sheet.
        </p>
        <UiButton
          variant="outline"
          :loading="exportData.isPending.value"
          @click="exportData.mutate()"
        >
          <Download v-if="!exportData.isPending.value" aria-hidden="true" />
          Tải file Excel
        </UiButton>
      </UiCard>

      <UiCard class="border-danger-soft p-5">
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
          <UiFileInput v-model="restoreFile" accept=".sql" :disabled="restore.isPending.value" />
        </div>

        <UiButton
          variant="destructive"
          :disabled="!restoreFile"
          :loading="restore.isPending.value"
          @click="confirmRestore = true"
        >
          <Upload v-if="!restore.isPending.value" aria-hidden="true" />
          Phục hồi
        </UiButton>
      </UiCard>

      <UiCard class="p-5">
        <div class="flex items-center gap-2 font-semibold">
          <Upload class="size-4" aria-hidden="true" />
          Nhập dữ liệu từ Excel
        </div>
        <p class="mt-1 text-sm text-muted-foreground">
          Thêm thể loại và sách từ file <code class="font-mono text-xs">.xlsx</code>.
        </p>

        <div class="mt-3 flex gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Info class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Chỉ thêm bản ghi mới, dữ liệu đang có không bị thay đổi.</span>
        </div>

        <div class="mt-4 mb-3">
          <UiFileInput v-model="importFile" accept=".xlsx" :disabled="importBooks.isPending.value" />
        </div>

        <UiButton
          variant="outline"
          :disabled="!importFile"
          :loading="importBooks.isPending.value"
          @click="runImport"
        >
          <Upload v-if="!importBooks.isPending.value" aria-hidden="true" />
          Nhập dữ liệu
        </UiButton>

        <div v-if="importBooks.data.value" class="mt-4 space-y-3">
          <div
            v-for="sheet in importBooks.data.value.sheets"
            :key="sheet.sheet"
            class="rounded-lg border p-3 text-sm"
          >
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <strong>{{ sheet.sheet }}</strong>
              <span>
                Nhập được
                <strong class="text-success-soft-foreground">{{ sheet.imported }}</strong>
              </span>
              <span v-if="sheet.skipped">
                Bỏ qua
                <strong class="text-danger-soft-foreground">{{ sheet.skipped }}</strong>
                dòng
              </span>
            </div>

            <ul
              v-if="sheet.errors.length"
              class="mt-2 max-h-40 space-y-1 overflow-y-auto border-t pt-2 text-xs text-muted-foreground"
            >
              <li v-for="(line, i) in sheet.errors" :key="i">{{ line }}</li>
            </ul>
          </div>
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
        Hãy chắc chắn bạn đã có bản sao lưu gần nhất trước khi tiếp tục.
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
