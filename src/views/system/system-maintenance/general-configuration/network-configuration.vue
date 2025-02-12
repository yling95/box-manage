<template>
  <g-conf-module :show-page-tools="false">
    <template #Slot-Conf-Module-Header>
      <div class="g-second-page-title">
        <i class="iconfont icon-arrow-go-back-line" @click="$router.go(-1)"></i>
        <div class="title" style="color: white">网络配置</div>
      </div>
    </template>
    <template #Slot-Conf-Module-Content>
      <div class="the-network-content">
        <div class="the-network-config">
          <div class="the-common-title">Box网络配置</div>
          <a-spin :spinning="networkSpinning">
            <div class="the-network-form-box">
              <div class="the-network-form">
                <a-form
                  :model="networkConfig"
                  name="network-configuration"
                  ref="networkFormRef"
                  :rules="addRules"
                  layout="vertical"
                >
                  <a-form-item name="network">
                    <div class="network-card-status">
                      <p>{{ networkConfig.network }}</p>
                      <div>
                        <LinkSuceedSvg v-if="networkConfig.networkStatus === 1" />
                        <LinkErrorSvg v-else />
                        <span>{{ networkConfig.networkStatus === 1 ? '连接正常' : '连接异常' }}</span>
                      </div>
                    </div>
                  </a-form-item>
                  <a-form-item name="networkSettingType">
                    <span class="dhcp-text">DHCP</span>
                    <a-switch
                      @click="switchClick(1)"
                      :checked="networkConfig.networkSettingType"
                      :disabled="networkConfig.networkStatus === 0"
                    />
                  </a-form-item>
                  <a-form-item name="mac" label="MAC地址">
                    <a-input v-model:value="networkConfig.mac" disabled placeholder="请输入" />
                  </a-form-item>
                  <a-form-item name="ip" label="IP地址">
                    <a-input
                      v-model:value="networkConfig.ip"
                      :disabled="networkConfig.networkSettingType"
                      placeholder="请输入"
                    />
                  </a-form-item>
                  <a-form-item name="cidr" label="IP子网掩码">
                    <a-input
                      v-model:value="networkConfig.cidr"
                      :disabled="networkConfig.networkSettingType"
                      placeholder="请输入"
                    />
                  </a-form-item>
                  <a-form-item name="gateway" label="IP默认网关">
                    <a-input
                      v-model:value="networkConfig.gateway"
                      :disabled="networkConfig.networkSettingType"
                      placeholder="请输入"
                    />
                  </a-form-item>
                  <a-form-item name="dns" label="DNS">
                    <a-input
                      v-model:value="networkConfig.dns"
                      :disabled="networkConfig.networkSettingType"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </a-form>
              </div>
              <!-- 第二个网口 -->
              <div class="the-network-form">
                <a-form
                  :model="networkConfigSecond"
                  name="network-configuration1"
                  ref="networkFormRef2"
                  :rules="addRules"
                  layout="vertical"
                >
                  <a-form-item name="network">
                    <div class="network-card-status">
                      <p>{{ networkConfigSecond.network }}</p>
                      <div>
                        <LinkSuceedSvg v-if="networkConfigSecond.networkStatus === 1" />
                        <LinkErrorSvg v-else />
                        <span>{{ networkConfigSecond.networkStatus === 1 ? '连接正常' : '连接异常' }}</span>
                      </div>
                    </div>
                  </a-form-item>
                  <a-form-item name="networkSettingType">
                    <span class="dhcp-text">DHCP</span>
                    <a-switch
                      @click="switchClick(2)"
                      :checked="networkConfigSecond.networkSettingType"
                      :disabled="networkConfigSecond.networkStatus === 0"
                    />
                  </a-form-item>
                  <a-form-item name="mac" label="MAC地址">
                    <a-input v-model:value="networkConfigSecond.mac" disabled placeholder="请输入" />
                  </a-form-item>
                  <a-form-item name="ip" label="IP地址">
                    <a-input
                      v-model:value="networkConfigSecond.ip"
                      :disabled="networkConfigSecond.networkSettingType"
                      placeholder="请输入"
                    />
                  </a-form-item>
                  <a-form-item name="cidr" label="IP子网掩码">
                    <a-input
                      v-model:value="networkConfigSecond.cidr"
                      :disabled="networkConfigSecond.networkSettingType"
                      placeholder="请输入"
                    />
                  </a-form-item>
                  <a-form-item name="gateway" label="IP默认网关">
                    <a-input
                      v-model:value="networkConfigSecond.gateway"
                      :disabled="networkConfigSecond.networkSettingType"
                      placeholder="请输入"
                    />
                  </a-form-item>
                  <a-form-item name="dns" label="DNS">
                    <a-input
                      v-model:value="networkConfigSecond.dns"
                      :disabled="networkConfigSecond.networkSettingType"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </a-form>
              </div>
            </div>
            <a-button
              v-if="!networkConfigSecond.networkSettingType || !networkConfig.networkSettingType"
              type="primary"
              v-auth="'system-maintenance-network-edit'"
              class="save-btn"
              @click="networkSubmit"
              :loading="loading"
              >保存</a-button
            >
          </a-spin>
        </div>
        <div class="the-server-information">
          <div class="the-common-title">SIP服务器信息</div>
          <div class="the-information-list">
            <a-spin :spinning="networkSpinning">
              <a-list item-layout="horizontal" :data-source="sipInformation" :locale="{ emptyText: ' ' }">
                <!-- 暂无数据的效果 -->
                <!-- <div style="display: flex; justify-content: center; margin-top: 100px" v-if="sipInformation?.length <= 0">
                <div style="display: flex; flex-direction: column; align-items: center">
                  <img style="width: 80px; height: 80px" src="@/assets/images/alarm/icon_list_empty.png" />
                  <p style="color: rgba(255, 255, 255, 0.45)">无数据</p>
                </div>
              </div> -->
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-list-item-meta>
                      <template #title>
                        <a class="information-title">{{ item.title }}</a>
                      </template>
                      <template #description>
                        <a class="information-description">{{ item.description }}</a>
                      </template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
            </a-spin>
          </div>
        </div>
      </div>
    </template>
  </g-conf-module>

  <g-modal
    v-model:visible="dhcpTipVisible"
    :title="'提示'"
    :mask-closable="false"
    @ok="confirmChangeDHCP"
    :centered="true"
    :width="416"
  >
    <div class="dhcp-tip">
      <i class="iconfont icon-information-fill"></i>
      <div class="info-text">
        <p>
          点击确认后，新设置将立即生效。请注意，之后您需要使用更新的IP地址来访问本系统。为确保顺畅访问，请务必妥善记录新配置信息。
        </p>
        <a-tooltip :overlayStyle="{ maxWidth: '368px !important' }" :overlayInnerStyle="{ width: '368px !important' }">
          <template #title>
            <div class="guide-tooltip">
              <p>1、开启DHCP时请通过渠道扫描工具扫描/连接显示器方式査看IP</p>
              <p>2、选择手动输入时请记录对应IP信息/连接显示器方式查看IP</p>
              <p>3、关闭DHCP但未进行任何编辑时，系统会默认之前使用的IP地址</p>
            </div>
          </template>
          <div class="info-guide">
            <span>DHCP配置与IP地址查看指南</span>
            <i class="iconfont icon-question-line"></i>
          </div>
        </a-tooltip>
      </div>
    </div>
  </g-modal>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, createVNode } from 'vue'
import { systemApi } from '@/services/api'
import { Rule } from 'ant-design-vue/es/form'
import { ipReg, gatewayReg, cidrReg, dnsNameRegex } from '@/utils/regular'
import { FormInstance, Modal, SelectProps } from 'ant-design-vue'
import { message, confirm } from '@/utils/antd.util'
import { cloneDeep } from 'g6-fn'
import LinkSuceedSvg from '@/assets/svg/link-succeed.svg?component'
import LinkErrorSvg from '@/assets/svg/link-error.svg?component'

interface networkProps {
  network: string
  mac: string
  ip: string
  cidr: string
  gateway: string
  dns: string
  networkSettingType: boolean
  networkStatus: number
}
const networkConfig = reactive<networkProps>({
  network: 'eth0',
  mac: '',
  ip: '',
  cidr: '',
  gateway: '',
  dns: '',
  networkSettingType: false,
  networkStatus: 0,
})
const networkConfigSecond = reactive<networkProps>({
  network: 'eth1',
  mac: '',
  ip: '',
  cidr: '',
  gateway: '',
  dns: '',
  networkSettingType: false,
  networkStatus: 0,
})
const loading = ref(false)

const networkFormRef = ref<FormInstance>()
const networkFormRef2 = ref<FormInstance>()
const networkSpinning = ref<boolean>(true)
// 表格正则
const addRules: Record<string, Rule[]> = {
  ip: [
    { required: true, message: '请输入ip地址', trigger: 'blur' },
    {
      pattern: ipReg,
      message: '请输入正确的IP地址，其中每个数字的范围为0-255',
      trigger: 'blur',
    },
  ],
  cidr: [
    { required: true, message: '请输入IP子网掩码', trigger: 'blur' },
    {
      pattern: cidrReg,
      message: '请输入正确的IP子网掩码，其中每个数字的范围为0-255',
      trigger: 'blur',
    },
  ],
  gateway: [
    { required: true, message: '请输入IP默认网关', trigger: 'blur' },
    {
      pattern: ipReg,
      message: '请输入正确的IP默认网关，其中每个数字的范围为0-255',
      trigger: 'blur',
    },
  ],
  dns: [
    { required: true, message: '请输入DNS', trigger: 'blur' },
    {
      pattern: ipReg,
      message: '请输入正确的DNS，其中每个数字的范围为0-255',
      trigger: 'blur',
    },
  ],
}

interface sipItem {
  title: string
  description?: string
}

let sipInformation = ref<sipItem[]>([])

// 获取表格数据
onMounted(() => {
  getBoxForm()
})

// dhcp Switch
const dhcpTipVisible = ref(false)
const dhcpTipType = ref<number>(1)
const switchClick = (type: 1 | 2) => {
  dhcpTipVisible.value = true
  dhcpTipType.value = type
}

const confirmChangeDHCP = async () => {
  let dhcpStatus = false
  if (dhcpTipType.value === 1) {
    networkConfig.networkSettingType = !networkConfig.networkSettingType
    dhcpStatus = networkConfig.networkSettingType
  }
  if (dhcpTipType.value === 2) {
    networkConfigSecond.networkSettingType = !networkConfigSecond.networkSettingType
    dhcpStatus = networkConfigSecond.networkSettingType
  }
  dhcpChange(dhcpStatus, dhcpTipType.value)
  dhcpTipVisible.value = false
}

const dhcpChange = async (checked: boolean, networkType: number) => {
  if (!checked) return
  networkSpinning.value = true
  try {
    let config = cloneDeep([networkType === 1 ? networkConfig : networkConfigSecond])
    config[0].networkSettingType = config[0].networkSettingType ? 'auto' : 'manual'

    await systemApi.putNetSettingV2(config)

    let { data } = await systemApi.getNetSettingV2()

    if (data) {
      if (networkType === 1) {
        Object.assign(networkConfig, { ...data[0] })
        networkConfig.networkSettingType = data[0].networkSettingType === 'manual' ? false : true
      } else {
        Object.assign(networkConfigSecond, { ...data[1] })
        networkConfigSecond.networkSettingType = data[1].networkSettingType === 'manual' ? false : true
      }
    }
    networkSpinning.value = false
  } catch (error) {
    networkSpinning.value = false
    console.log(error)
  }
}
const getSipList = async () => {
  try {
    let { data } = await systemApi.getSip()
    for (const key in data) {
      let sipTitle = ''
      switch (key) {
        case 'id':
          sipTitle = 'ID'
          break
        case 'domain':
          sipTitle = '域'
          break
        case 'ip':
          sipTitle = '地址'
          break
        case 'port':
          sipTitle = '端口'
          break
        default:
          break
      }
      sipInformation.value.push({
        title: sipTitle,
        description: data[key] || '暂无数据',
      })
    }
  } catch (error) {
    console.log('error', error)
  }
}
const formValidate = async () => {
  const validationPromises = [
    networkConfig.networkStatus === 1 && networkFormRef.value?.validate(),
    networkConfigSecond.networkStatus === 1 && networkFormRef2.value?.validate(),
  ]
  // 并行执行所有验证操作
  await Promise.all(validationPromises)
}
/**
 * 保存表格配置
 */
const networkSubmit = async () => {
  networkSpinning.value = true
  loading.value = true
  try {
    await formValidate()
    let config = cloneDeep([networkConfig, networkConfigSecond])
    config[0].networkSettingType = config[0].networkSettingType ? 'auto' : 'manual'
    config[1].networkSettingType = config[1].networkSettingType ? 'auto' : 'manual'
    await systemApi.putNetSettingV2(config)
    message.success('操作成功')
    networkSpinning.value = false
    loading.value = false
  } catch (error) {
    networkSpinning.value = false
    loading.value = false
    console.error('异常', error)
  }
}
/**
 * 获取box网络配置
 */
const getBoxForm = async () => {
  sipInformation.value = []
  try {
    let { data } = await systemApi.getNetSettingV2()
    if (data) {
      networkSpinning.value = false
      Object.assign(networkConfig, { ...data[0] })
      Object.assign(networkConfigSecond, { ...data[1] })
      networkConfig.networkSettingType = data[0].networkSettingType === 'manual' ? false : true
      networkConfigSecond.networkSettingType = data[1].networkSettingType === 'manual' ? false : true
    }
    getSipList()
  } catch (error) {
    networkSpinning.value = false
    console.log('error', error)
  }
}
</script>

<style lang="less" scoped>
.guide-tooltip {
  font-size: 12px;
  color: @text2;
}
.dhcp-tip {
  padding-bottom: 0;
  display: flex;
  gap: 16px;
  .icon-information-fill {
    color: rgba(0, 156, 248, 1);
    font-size: 24px;
  }
  .info-text {
    color: @text1;
    line-height: 22px;
  }
  .info-guide {
    margin-top: 16px;
    color: #8599bf;
    font-size: 12px;
    display: flex;
    align-items: center;
    cursor: default;
    .icon-question-line {
      margin-left: 8px;
      font-size: 14px;
    }
  }
}

.the-network-content {
  display: flex;
  justify-content: center;
  gap: 80px;
  height: 100%;

  .the-common-title {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    color: @text1;
    position: relative;
    padding-left: 11px;

    &::before {
      content: '';
      position: absolute;
      top: 3px;
      left: 0;
      width: 3px;
      height: 18px;
      border-radius: 2px;
      background: @primary2;
    }
  }

  .the-network-config {
    width: 742px;

    :deep(.ant-select-disabled) {
      .ant-select-selection-item {
        color: #8b949e;
      }
    }

    :deep(.ant-form-item-explain) {
      height: 0;
      min-height: auto;
    }

    .network-card-status {
      display: flex;
      align-items: center;
      color: #fff;
      font-size: 14px;

      > p {
        font-size: 16px;
        margin-right: 8px;
        font-weight: 700;
        font-family: 'Noto Sans SC';
      }

      span {
        font-size: 14px;
        color: @text3;
        margin-left: 2px;
        vertical-align: 1px;
      }
    }

    .dhcp-text {
      color: #fff;
      font-size: 14px;
      vertical-align: -2px;
      margin-right: 8px;
    }

    .the-network-form-box {
      display: flex;
      // align-items: center;
      gap: 0 40px;
      margin-top: 16px;
      width: 742px;
      // height: 722px;
      padding: 20px 20px 80px 20px;
      border-radius: 4px;
      border: 1px solid @border3;
      background: #202c40;
      border-radius: 4px;
      // overflow-y: scroll;
      // margin-bottom: 40px;

      .the-network-form {
        width: 320px;
      }

      .ant-row {
        margin-bottom: 40px !important;
      }
    }

    .save-btn {
      position: relative;
      top: -80px;
      left: 20px;
    }
  }

  .the-server-information {
    width: 360px;
    height: 100%;

    .the-information-list {
      border-radius: 4px;
      border: 1px solid @mask2;
      background: #202c40;
      margin-top: 16px;
      width: 360px;
      height: 404px;
      border-radius: 4px;
      padding: 12px 20px;

      ::v-deep(.ant-list-split .ant-list-item) {
        border-bottom: 1px solid #d9d9db;

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}

.ant-list-item-meta-content {
  .ant-list-item-meta-title {
    a {
      color: @text2;
    }
  }
}

.ant-list-item-meta-description {
  color: @text1 !important;
}

.ant-list-split {
  .ant-list-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  }
}

.information-title {
  color: @text2;
}

.information-description {
  color: @text1;
}
</style>
