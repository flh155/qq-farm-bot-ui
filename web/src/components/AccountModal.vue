<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import api from '@/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'

const props = defineProps<{
  show: boolean
  editData?: any
}>()

const emit = defineEmits(['close', 'saved'])

const activeTab = ref('manual') // qr, manual - 默认改为手动填码
const loading = ref(false)
const qrData = ref<{ image?: string, code: string, qrcode?: string, url?: string } | null>(null)
const qrStatus = ref('')
const errorMessage = ref('')

const form = reactive({
  name: '',
  code: '',
  platform: 'qq',
})

const manualNameHint = computed(() => form.platform === 'qq'
  ? '留空备注名时，会在保存后自动同步游戏名称。'
  : '微信小程序保留原逻辑，留空时将使用默认备注名。')
const manualNamePlaceholder = computed(() => form.platform === 'qq'
  ? '留空自动同步游戏名称'
  : '留空默认账号名')

async function addAccount(data: any) {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.post('/api/accounts', data)
    if (res.data.ok) {
      emit('saved')
      close()
    }
    else {
      errorMessage.value = `保存失败：${res.data.error}`
    }
  }
  catch (e: any) {
    errorMessage.value = `保存失败：${e.response?.data?.error || e.message}`
  }
  finally {
    loading.value = false
  }
}

async function submitManual() {
  errorMessage.value = ''
  if (!form.code) {
    errorMessage.value = '请输入 Code 或 进行扫码'
    return
  }

  if (!form.name && props.editData) {
    errorMessage.value = '请输入名称'
    return
  }

  let code = form.code.trim()
  // Try to extract code from URL if present
  const match = code.match(/[?&]code=([^&]+)/i)
  if (match && match[1]) {
    code = decodeURIComponent(match[1])
    form.code = code // Update UI
  }

  // 检查是否仅修改了备注
  let payload = {}
  if (props.editData) {
    // 编辑模式：检查是否只修改了备注
    const onlyNameChanged = form.name !== props.editData.name
      && form.code === (props.editData.code || '')
      && form.platform === (props.editData.platform || 'qq')

    if (onlyNameChanged) {
      // 仅修改了备注，只发送 id 和 name
      payload = {
        id: props.editData.id,
        name: form.name,
      }
    }
    else {
      // 修改了其他字段，发送完整 payload
      payload = {
        id: props.editData.id,
        name: form.name,
        code,
        platform: form.platform,
        loginType: 'manual',
      }
    }
  }
  else {
    // 新增模式，发送完整 payload
    payload = {
      name: form.name,
      code,
      platform: form.platform,
      loginType: 'manual',
    }
  }

  await addAccount(payload)
}

function close() {
  emit('close')
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    errorMessage.value = ''
    if (props.editData) {
      // Edit mode: Default to manual fill
      activeTab.value = 'manual'
      form.name = props.editData.name
      form.code = props.editData.code || ''
      form.platform = props.editData.platform || 'qq'
    }
    else {
      // Add mode: Default to manual fill
      activeTab.value = 'manual'
      form.name = ''
      form.code = ''
      form.platform = 'qq'
    }
  }
  else {
    // Reset when closed
    qrData.value = null
    qrStatus.value = ''
  }
})
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="max-w-md w-full overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
      <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ editData ? '编辑账号' : '添加账号' }}
        </h3>
        <BaseButton variant="ghost" class="!p-1" @click="close">
          <div class="i-carbon-close text-xl" />
        </BaseButton>
      </div>

      <div class="p-4 text-gray-900 dark:text-white">
        <!-- 停用提示 -->
        <div class="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700">
          <div class="flex items-start gap-2">
            <div class="i-carbon-warning text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium mb-1">扫码功能暂时停用</p>
              <p class="text-xs opacity-80">请使用手动填码方式添加账号。</p>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {{ errorMessage }}
        </div>
        <!-- Tabs -->
        <div class="mb-4 flex border-b border-gray-200 dark:border-gray-700">
          <button
            class="flex-1 py-2 text-center font-medium opacity-50 cursor-not-allowed"
            disabled
          >
            <span class="text-gray-500 dark:text-gray-400">
              {{ editData ? '扫码更新' : '扫码登录' }}
              <span class="ml-1 text-xs">(停用)</span>
            </span>
          </button>
          <button
            class="flex-1 py-2 text-center font-medium"
            :class="activeTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'"
            @click="activeTab = 'manual'"
          >
            手动填码
          </button>
        </div>

        <!-- QR Tab -->
        <div v-if="activeTab === 'qr'" class="flex flex-col items-center justify-center py-4 space-y-4">
          <div class="w-full text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              扫码默认使用 QQ 昵称
            </p>
          </div>

          <div class="border rounded bg-white p-2 opacity-50 dark:bg-gray-700">
            <div class="h-48 w-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
              <div class="i-carbon-warning text-4xl" />
            </div>
          </div>
          <p class="text-sm text-amber-600 dark:text-amber-400 font-medium">
            此功能已停用
          </p>
          <div class="flex gap-2">
            <BaseButton 
              variant="text" 
              size="sm"
              disabled
              class="opacity-50 cursor-not-allowed"
            >
              刷新二维码
            </BaseButton>
            <BaseButton
              variant="text"
              size="sm"
              class="text-blue-600 md:hidden opacity-50 cursor-not-allowed dark:text-blue-400"
              disabled
            >
              跳转 QQ 登录
            </BaseButton>
          </div>
        </div>

        <!-- Manual Tab -->
        <div v-if="activeTab === 'manual'" class="space-y-4">
          <div class="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {{ manualNameHint }}
          </div>

          <BaseInput
            v-model="form.name"
            label="备注名称"
            :placeholder="manualNamePlaceholder"
          />

          <BaseTextarea
            v-model="form.code"
            label="Code"
            placeholder="请输入登录 Code"
            :rows="3"
          />

          <BaseSelect
            v-if="!editData"
            v-model="form.platform"
            label="平台"
            :options="[
              { label: 'QQ 小程序', value: 'qq' },
              { label: '微信小程序', value: 'wx' },
            ]"
          />

          <div class="flex justify-end gap-2 pt-4">
            <BaseButton
              variant="outline"
              @click="close"
            >
              取消
            </BaseButton>
            <BaseButton
              variant="primary"
              :loading="loading"
              @click="submitManual"
            >
              {{ editData ? '保存' : '添加' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
