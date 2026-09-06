<template>
  <!-- 遮罩 -->
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    @click.self="$emit('close')"
  >
    <!-- 弹窗容器：移动端底部面板，桌面端居中弹窗 -->
    <div
      class="sheet-up flex max-h-[85vh] w-full flex-col rounded-t-xl bg-white shadow-xl sm:modal-in sm:max-w-[480px] sm:rounded-lg"
    >
      <!-- 拖拽指示条（移动端） -->
      <div class="flex justify-center pt-sm sm:hidden">
        <div class="h-1 w-10 rounded-full bg-neutral-border"></div>
      </div>

      <!-- 标题 -->
      <div class="flex items-center justify-between px-lg py-base">
        <h2 class="text-h2 text-neutral-title">{{ isEdit ? '编辑植物' : '新增植物' }}</h2>
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full text-neutral-secondary hover:bg-neutral-bg"
          @click="$emit('close')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- 表单主体 -->
      <div class="flex-1 overflow-y-auto px-lg pb-lg">
        <!-- 封面图 -->
        <label class="mb-md block text-body font-medium text-neutral-body">封面图 <span class="text-danger">*</span></label>
        <div class="mb-lg">
          <div v-if="previewUrl" class="relative mb-sm overflow-hidden rounded-md">
            <img :src="previewUrl" class="aspect-[4/3] w-full object-cover" alt="封面预览" />
            <button
              type="button"
              class="absolute right-sm top-sm flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
              @click="clearImage"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <button
            v-else
            type="button"
            class="flex aspect-[4/3] w-full flex-col items-center justify-center gap-sm rounded-md border-2 border-dashed border-neutral-border text-neutral-secondary transition-colors hover:border-primary hover:text-primary"
            @click="triggerFile"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.6" />
            </svg>
            <span class="text-body">点击上传封面图</span>
          </button>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
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

        <!-- 植物名称 -->
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">植物名称 <span class="text-danger">*</span></label>
          <input
            v-model="form.name"
            type="text"
            placeholder="给它起个名字"
            class="h-12 w-full rounded-md border border-neutral-border bg-white px-base text-body-l text-neutral-title placeholder:text-neutral-placeholder focus:border-primary focus:shadow-focus-primary focus:outline-none"
          />
        </div>

        <!-- 品类 / 品系 / 品种（支持联想） -->
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">品类</label>
          <AutocompleteInput
            v-model="form.category"
            :suggestions="categorySuggestions"
            placeholder="如：月季、多肉、观叶"
          />
        </div>
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">品系</label>
          <AutocompleteInput
            v-model="form.strain"
            :suggestions="strainSuggestions"
            placeholder="如：爬藤月季、切花月季"
          />
        </div>
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">品种</label>
          <AutocompleteInput
            v-model="form.variety"
            :suggestions="varietySuggestions"
            placeholder="如：粉龙沙宝石、果汁阳台"
          />
        </div>

        <!-- 入手时间 -->
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">入手时间 <span class="text-danger">*</span></label>
          <input
            v-model="form.acquire_date"
            type="date"
            class="h-12 w-full rounded-md border border-neutral-border bg-white px-base text-body-l text-neutral-title focus:border-primary focus:shadow-focus-primary focus:outline-none"
          />
        </div>

        <!-- 入手渠道 -->
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">入手渠道</label>
          <input
            v-model="form.acquire_source"
            type="text"
            placeholder="如：淘宝、花市、朋友送的"
            class="h-12 w-full rounded-md border border-neutral-border bg-white px-base text-body-l text-neutral-title placeholder:text-neutral-placeholder focus:border-primary focus:shadow-focus-primary focus:outline-none"
          />
        </div>

        <!-- 当前状态 -->
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">当前状态</label>
          <select
            v-model="form.current_status"
            class="h-12 w-full rounded-md border border-neutral-border bg-white px-base text-body-l text-neutral-title focus:border-primary focus:shadow-focus-primary focus:outline-none"
          >
            <option value="">请选择</option>
            <option v-for="s in PLANT_STATUS" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <!-- 备注 -->
        <div class="mb-lg">
          <label class="mb-sm block text-body font-medium text-neutral-body">备注</label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="其他想记录的..."
            class="w-full resize-none rounded-md border border-neutral-border bg-white px-base py-md text-body-l text-neutral-title placeholder:text-neutral-placeholder focus:border-primary focus:shadow-focus-primary focus:outline-none"
          ></textarea>
        </div>

        <!-- 删除植物（仅编辑模式） -->
        <button
          v-if="isEdit"
          type="button"
          class="mb-lg h-12 w-full rounded-md bg-danger/10 text-body-l font-semibold text-danger transition-colors hover:bg-danger/15"
          @click="requestDelete"
        >
          删除植物
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AutocompleteInput from './AutocompleteInput.vue'
import { PLANT_STATUS } from '../utils/constants'
import { todayStr } from '../utils/date'
import { isImageTooLarge } from '../utils/image'
import { usePlantStore } from '../stores/plantStore'

const props = defineProps({
  // 编辑时传入的植物对象，新增时为 null
  plant: { type: Object, default: null }
})

const emit = defineEmits(['close', 'saved'])

const plantStore = usePlantStore()

const isEdit = computed(() => !!props.plant)
const fileInput = ref(null)
const coverFile = ref(null)
const previewUrl = ref('')
const submitting = ref(false)
const uploadProgress = ref(0)
const isUploading = ref(false)

const form = reactive({
  name: '',
  cover_image: '',
  category: '',
  strain: '',
  variety: '',
  acquire_date: todayStr(),
  acquire_source: '',
  current_status: '',
  notes: ''
})

onMounted(() => {
  if (props.plant) {
    form.name = props.plant.name || ''
    form.cover_image = props.plant.cover_image || ''
    form.category = props.plant.category || ''
    form.strain = props.plant.strain || ''
    form.variety = props.plant.variety || ''
    form.acquire_date = props.plant.acquire_date || todayStr()
    form.acquire_source = props.plant.acquire_source || ''
    form.current_status = props.plant.current_status || ''
    form.notes = props.plant.notes || ''
    previewUrl.value = props.plant.cover_image || ''
  }
})

// 联想建议：从已有植物中提取去重值
const categorySuggestions = computed(() =>
  [...new Set(plantStore.plants.map((p) => p.category).filter(Boolean))]
)
const strainSuggestions = computed(() =>
  [...new Set(plantStore.plants.map((p) => p.strain).filter(Boolean))]
)
const varietySuggestions = computed(() =>
  [...new Set(plantStore.plants.map((p) => p.variety).filter(Boolean))]
)

const canSubmit = computed(() => form.name.trim() && form.acquire_date && (coverFile.value || form.cover_image))

function triggerFile() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (isImageTooLarge(file)) {
    alert('图片超过 5MB，请选择更小的图片')
    if (fileInput.value) fileInput.value.value = ''
    return
  }
  coverFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function clearImage() {
  coverFile.value = null
  previewUrl.value = ''
  form.cover_image = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  isUploading.value = true
  uploadProgress.value = 0
  try {
    const payload = {
      ...form,
      coverFile: coverFile.value
    }
    if (isEdit.value) {
      await plantStore.updatePlant(props.plant.id, payload, (p) => (uploadProgress.value = p))
    } else {
      await plantStore.addPlant(payload, (p) => (uploadProgress.value = p))
    }
    emit('saved')
    emit('close')
  } catch (e) {
    alert('保存失败：' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
    isUploading.value = false
  }
}

function requestDelete() {
  if (confirm('确定要删除这株植物吗？其所有生长记录也会一并删除，此操作不可恢复。')) {
    submitDelete()
  }
}

async function submitDelete() {
  submitting.value = true
  try {
    await plantStore.deletePlant(props.plant.id)
    emit('saved')
    emit('close')
  } catch (e) {
    alert('删除失败：' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}
</script>
