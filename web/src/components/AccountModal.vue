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

const activeTab = ref('manual')
const loading = ref(false)
const qrData = ref<{ image?: string, code: string, qrcode?: string, url?: string } | null>(null)
const qrStatus = ref('')
const errorMessage = ref('')
const showQrWarning = ref(false)
const customApiDomain = ref('q.qq.com')
const useCustomApi = ref(false)

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

let qrCheckTimer: number | undefined

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
  const match = code.match(/[?&]code=([^&]+)/i)
  if (match && match[1]) {
    code = decodeURIComponent(match[1])
    form.code = code
  }

  let payload = {}
  if (props.editData) {
    const onlyNameChanged = form.name !== props.editData.name
      && form.code === (props.editData.code || '')
      && form.platform === (props.editData.platform || 'qq')

    if (onlyNameChanged) {
      payload = {
        id: props.editData.id,
        name: form.name,
      }
    }
    else {
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
    payload = {
      name: form.name,
      code,
      platform: form.platform,
      loginType: 'manual',
    }
  }

  await addAccount(payload)
}

async function createQRCode() {
  loading.value = true
  errorMessage.value = ''
  qrStatus.value = '正在加载二维码...'
  try {
    const payload: any = {}
    if (useCustomApi.value && customApiDomain.value.trim()) {
      payload.apiDomain = customApiDomain.value.trim()
    }
    
    const res = await api.post('/api/qr/create', payload)
    if (res.data.ok) {
      qrData.value = res.data.data
      qrStatus.value = ''
      startQrCheck()
    }
    else {
      errorMessage.value = `获取二维码失败：${res.data.error}`
      qrStatus.value = '获取失败'
    }
  }
  catch (e: any) {
    errorMessage.value = `获取二维码失败：${e.response?.data?.error || e.message}`
    qrStatus.value = '获取失败'
  }
  finally {
    loading.value = false
  }
}

function startQrCheck() {
  if (qrCheckTimer) {
    clearInterval(qrCheckTimer)
  }
  
  qrCheckTimer = window.setInterval(async () => {
    if (!qrData.value?.code) return
    
    try {
      const checkPayload: any = { code: qrData.value.code }
      if (useCustomApi.value && customApiDomain.value.trim()) {
        checkPayload.apiDomain = customApiDomain.value.trim()
      }
      
      const res = await api.post('/api/qr/check', checkPayload)
      if (res.data.ok) {
        const status = res.data.data.status
        if (status === 'OK') {
          stopQrCheck()
          qrStatus.value = '扫码成功！'
          form.code = res.data.data.code
          if (res.data.data.nickname) {
            form.name = res.data.data.nickname
          }
          setTimeout(() => {
            submitManual()
          }, 500)
        }
        else if (status === 'Used') {
          stopQrCheck()
          qrStatus.value = '二维码已过期'
          qrData.value = null
        }
        else if (status === 'Wait') {
          qrStatus.value = '等待扫码...'
        }
        else {
          qrStatus.value = res.data.data.error || '状态未知'
        }
      }
    }
    catch (e: any) {
      console.error('检查二维码状态失败:', e)
    }
  }, 2000)
}

function stopQrCheck() {
  if (qrCheckTimer) {
    clearInterval(qrCheckTimer)
    qrCheckTimer = undefined
  }
}

function handleQrClick() {
  showQrWarning.value = true
}

function confirmQrLogin() {
  showQrWarning.value = false
  activeTab.value = 'qr'
  createQRCode()
}

function cancelQrLogin() {
  showQrWarning.value = false
}

function openQrUrl() {
  if (qrData.value?.url) {
    window.open(qrData.value.url, '_blank')
  }
}

function toggleCustomApi() {
  useCustomApi.value = !useCustomApi.value
}

function close() {
  emit('close')
  stopQrCheck()
  qrData.value = null
  qrStatus.value = ''
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    errorMessage.value = ''
    if (props.editData) {
      activeTab.value = 'manual'
      form.name = props.editData.name
      form.code = props.editData.code || ''
      form.platform = props.editData.platform || 'qq'
    }
    else {
      activeTab.value = 'manual'
      form.name = ''
      form.code = ''
      form.platform = 'qq'
    }
  }
  else {
    close()
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
        <div v-if="errorMessage" class="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {{ errorMessage }}
        </div>

        <!-- Tabs -->
        <div class="mb-4 flex border-b border-gray-200 dark:border-gray-700">
          <button
            class="flex-1 py-2 text-center font-medium"
            :class="activeTab === 'qr' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'"
            @click="handleQrClick"
          >
            {{ editData ? '扫码更新' : '扫码登录' }}
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
          <div class="w-full">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                API 配置
              </label>
              <button
                class="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                @click="toggleCustomApi"
              >
                {{ useCustomApi ? '使用默认配置' : '自定义 API' }}
              </button>
            </div>
            
            <div v-if="useCustomApi" class="space-y-2">
              <BaseInput
                v-model="customApiDomain"
                type="text"
                placeholder="q.qq.com"
                label="二维码 API 域名"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400">
                输入自定义的二维码 API 域名，例如：q.qq.com 或其他可用域名
              </p>
            </div>
            <div v-else class="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              使用默认 API 配置 (q.qq.com)
            </div>
          </div>

          <div class="w-full text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              扫码默认使用 QQ 昵称
            </p>
          </div>

          <div v-if="qrData && qrData.image" class="border rounded bg-white p-2 dark:bg-gray-700">
            <img :src="qrData.image" alt="QR Code" class="h-48 w-48" />
          </div>
          <div v-else class="border rounded bg-gray-100 p-2 dark:bg-gray-700">
            <div class="h-48 w-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
              <div v-if="loading" class="i-carbon-loading text-4xl animate-spin" />
              <div v-else-if="qrStatus === '获取失败'" class="i-carbon-warning text-4xl" />
              <div v-else class="i-carbon-qr-code text-4xl" />
            </div>
          </div>

          <p v-if="qrStatus" class="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {{ qrStatus }}
          </p>

          <div class="flex gap-2">
            <BaseButton 
              variant="outline" 
              size="sm"
              :loading="loading"
              @click="createQRCode"
            >
              刷新二维码
            </BaseButton>
            <BaseButton
              v-if="qrData && qrData.url"
              variant="primary"
              size="sm"
              class="md:hidden"
              @click="openQrUrl"
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

  <!-- QR Warning Modal -->
  <div v-if="showQrWarning" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
    <div class="max-w-sm w-full mx-4 rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800">
      <div class="flex items-start gap-3 mb-4">
        <div class="i-carbon-warning text-2xl text-amber-500 flex-shrink-0" />
        <div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            扫码功能风险提示
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            扫码默认API目前暂时无法使用，但通过反馈得知扫车载wx二维码可以拿到code，因此临时开放该功能供部分有私有api的用户使用，请填写私有api或是直接到后端修改默认api以实现扫码登录获取code。(备注：相关技术请参考: https://www.52pojie.cn/thread-2071262-1-1.html)
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            点击确认后仍可继续使用扫码功能。
          </p>
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-4">
        <BaseButton
          variant="outline"
          @click="cancelQrLogin"
        >
          取消
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="confirmQrLogin"
        >
          确认使用
        </BaseButton>
      </div>
    </div>
  </div>
</template>