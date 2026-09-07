<template>
  <!-- 遮罩 -->
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    @click.self="$emit('close')"
  >
    <div
      class="sheet-up flex max-h-[85vh] w-full flex-col rounded-t-xl bg-white shadow-xl sm:modal-in sm:max-w-[480px] sm:rounded-lg"
    >
      <!-- 拖拽指示条（移动端） -->
      <div class="flex justify-center pt-sm sm:hidden">
        <div class="h-1 w-10 rounded-full bg-neutral-border"></div>
      </div>

      <!-- 标题 -->
      <div class="flex items-center justify-between px-lg py-base">
        <h2 class="text-h2 text-neutral-title">{{ isEdit ? '编辑记录' : '新增记录' }}</h2>
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full text-neutral-secondary hover:bg-neutral-bg"
          @click="$emit('close')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-lg pb-lg">
        <!-- 事件类型：9个预设标签点选 -->
        <label class="mb-sm block text-body font-medium text-neutral-body">事件类型 <span class="text-danger">*</span></label>
        <div class="mb-lg flex flex-wrap gap-sm">
          <button
            v-for="key in EVENT_TYPE_KEYS"
            :key="key"
            type="button"
            class="flex h-9 items-center gap-xs rounded-sm px-md text-caption font-semibold transition-all active:scale-[0.96]"
            :style="
              form.event_type === key
                ? { backgroundColor: EVENT_TYPES[key].text, color: '#fff' }
                : { backgroundColor: EVENT_TYPES[key].bg, color: EVENT_TYPES[key].text }
            "
            @click="form.event_type = key"
          >
            <Icon
              :name="EVENT_TYPES[key].icon"
              :size="14"
              :color="form.event_type === key ? '#fff' : EVENT_TYPES[key].text"
            />
            {{ EVENT_TYPES[key].label }}
          </button>
        </div>

        <!-- 记录时间 -->
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">记录时间 <span class="text-danger">*</span></label>
          <input
            v-model="form.record_date"
            type="datetime-local"
            class="h-12 w-full rounded-md border border-neutral-border bg-white px-base text-body-l text-neutral-title focus:border-primary focus:shadow-focus-primary focus:outline-none"
          />
        </div>

        <!-- 照片（最多9张） -->
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">照片（最多 9 张）</label>
          <div class="grid grid-cols-3 gap-xs">
            <!-- 已选照片预览 -->
            <div
              v-for="(img, i) in existingImages"
              :key="'e' + i"
              class="relative aspect-square overflow-hidden rounded-sm"
            >
              <img :src="img" class="h-full w-full object-cover" alt="照片" />
              <button
                type="button"
                class="absolute right-xs top-xs flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                @click="removeExistingImage(i)"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <!-- 新选照片预览 -->
            <div
              v-for="(img, i) in newPreviews"
              :key="'n' + i"
              class="relative aspect-square overflow-hidden rounded-sm"
            >
              <img :src="img" class="h-full w-full object-cover" alt="新照片" />
              <button
                type="button"
                class="absolute right-xs top-xs flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                @click="removeNewImage(i)"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <!-- 添加上传按钮 -->
            <button
              v-if="totalImages < 9"
              type="button"
              class="flex aspect-square flex-col items-center justify-center gap-xs rounded-sm border-2 border-dashed border-neutral-border text-neutral-secondary transition-colors hover:border-primary hover:text-primary"
              @click="triggerFile"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.6" />
              </svg>
              <span class="text-caption">{{ totalImages }}/9</span>
            </button>
          </div>
          <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFileChange" />
          <!-- 上传进度条 -->
          <div v-if="isUploading" class="mt-md">
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-neutral-bg">
              <div
                class="h-full rounded-full bg-primary transition-all duration-200"
                :style="{ width: Math.round(uploadProgress * 100) + '%' }"
              ></div>
            </div>
            <p class="mt-xs text-caption text-neutral-secondary">上传中 {{ Math.round(uploadProgress * 100) }}%</p>
          </div>
        </div>

        <!-- 备注 -->
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">备注</label>
          <textarea
            v-model="form.content"
            rows="4"
            placeholder="记录一下今天的变化..."
            class="w-full resize-none rounded-md border border-neutral-border bg-white px-base py-md text-body-l text-neutral-title placeholder:text-neutral-placeholder focus:border-primary focus:shadow-focus-primary focus:outline-none"
          ></textarea>
        </div>

        <!-- 删除记录（仅编辑模式） -->
        <button
          v-if="isEdit"
          type="button"
          class="mb-lg h-12 w-full rounded-md bg-danger/10 text-body-l font-semibold text-danger transition-colors hover:bg-danger/15"
          @click="requestDelete"
        >
          删除记录
        </button>
      </div>

      <!-- 底部按钮 -->
      <div class="flex gap-md border-t border-neutral-border px-lg py-base">
        <button
          class="h-12 flex-1 rounded-md border border-neutral-border bg-white text-body-l font-semibold text-neutral-body transition-colors hover:bg-neutral-bg"
          @click="$emit('close')"
        >
          取消
        </button>
        <button
          class="h-12 flex-1 rounded-md bg-primary text-body-l font-semibold text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:bg-neutral-border disabled:text-neutral-placeholder"
          :disabled="!canSubmit || submitting"
          @click="submit"
        >
          {{ isUploading ? '上传中 ' + Math.round(uploadProgress * 100) + '%' : submitting ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
      v-if="showDeleteConfirm"
      title="删除记录"
      message="确定要删除这条生长记录吗？此操作不可恢复。"
      confirm-text="删除"
      danger
      @confirm="submitDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Icon from './Icon.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { EVENT_TYPES, EVENT_TYPE_KEYS } from '../utils/constants'
import { nowLocalInput } from '../utils/date'
import { isImageTooLarge } from '../utils/image'
import { useRecordStore } from '../stores/recordStore'
import { toast } from '../utils/toast'

const props = defineProps({
  plantId: { type: String, required: true },
  record: { type: Object, default: null } // 编辑时传入
})

const emit = defineEmits(['close', 'saved'])

const recordStore = useRecordStore()

const isEdit = computed(() => !!props.record)
const fileInput = ref(null)
const newFiles = ref([])
const newPreviews = ref([])
const existingImages = ref([])
const submitting = ref(false)
const uploadProgress = ref(0) // 上传/压缩进度 0-1
const isUploading = ref(false)
const showDeleteConfirm = ref(false)

const form = reactive({
  event_type: 'water',
  record_date: nowLocalInput(),
  content: ''
})

onMounted(() => {
  if (props.record) {
    form.event_type = props.record.event_type || 'water'
    // datetime-local 需要的格式
    const d = new Date(props.record.record_date)
    const pad = (n) => String(n).padStart(2, '0')
    form.record_date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    form.content = props.record.content || ''
    existingImages.value = props.record.images || []
  }
})

const totalImages = computed(() => existingImages.value.length + newFiles.value.length)
const canSubmit = computed(() => !!form.event_type && !!form.record_date)

function triggerFile() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const files = Array.from(e.target.files)
  if (!files.length) return

  // 检查单张是否超 5MB
  const oversized = files.filter((f) => isImageTooLarge(f))
  if (oversized.length) {
    toast.error('有 ' + oversized.length + ' 张照片超过 5MB，已跳过')
  }

  const valid = files.filter((f) => !isImageTooLarge(f))
  const remain = 9 - totalImages.value
  const add = valid.slice(0, remain)
  add.forEach((f) => {
    newFiles.value.push(f)
    newPreviews.value.push(URL.createObjectURL(f))
  })
  if (fileInput.value) fileInput.value.value = ''
}

function removeNewImage(i) {
  newFiles.value.splice(i, 1)
  newPreviews.value.splice(i, 1)
}

function removeExistingImage(i) {
  existingImages.value.splice(i, 1)
}

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  isUploading.value = true
  uploadProgress.value = 0
  try {
    // 转成 ISO 时间戳（本地时间）
    const recordDate = new Date(form.record_date).toISOString()
    const payload = {
      record_date: recordDate,
      event_type: form.event_type,
      content: form.content,
      files: newFiles.value,
      images: existingImages.value
    }
    if (isEdit.value) {
      await recordStore.updateRecord(props.record.id, payload, (p) => (uploadProgress.value = p))
    } else {
      await recordStore.addRecord(props.plantId, payload, (p) => (uploadProgress.value = p))
    }
    emit('saved')
    emit('close')
    toast.success(isEdit.value ? '已更新' : '已保存')
  } catch (e) {
    toast.error('保存失败：' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
    isUploading.value = false
  }
}

function requestDelete() {
  showDeleteConfirm.value = true
}

async function submitDelete() {
  showDeleteConfirm.value = false
  submitting.value = true
  try {
    await recordStore.deleteRecord(props.record.id, props.plantId)
    emit('saved')
    emit('close')
    toast.success('已删除')
  } catch (e) {
    toast.error('删除失败：' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}
</script>
