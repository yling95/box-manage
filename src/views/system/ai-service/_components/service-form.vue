<template>
  <div class="service-form">
    <div class="center" v-if="loading">
      <a-spin></a-spin>
    </div>
    <template v-else>
      <a-form :model="serviceForm" layout="vertical" ref="serviceFormRef" :rules="serviceRules">
        <a-form-item name="aiSrvAlarmName">
          <template #label>
            <span>告警名称</span>
          </template>
          <a-input
            v-model:value.trim="serviceForm.aiSrvAlarmName"
            :max-length="20"
            placeholder="请输入报警名称"
            style="width: 313px; height: 38px"
          />
        </a-form-item>
        <a-form-item v-if="serviceForm.aiSrvDelayTriggerSeconds > -1" name="aiSrvDelayTriggerSeconds">
          <template #label>
            <span>触发延迟</span>

            <a-tooltip
              placement="top"
              :title="`持续检测到且超过设置周期，则产生告警, 数值范围：${serviceForm?.delayMin}～${serviceForm?.delayMax} ，默认值：${serviceForm?.recommend?.aiSrvDelayTriggerSeconds}`"
            >
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-tooltip
            placement="bottom"
            title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
            trigger="focus"
          >
            <a-input-number
              id="inputNumber"
              v-model:value="serviceForm.aiSrvDelayTriggerSeconds"
              :min="serviceForm?.delayMin"
              :max="serviceForm?.delayMax"
              :precision="0"
              style="width: 104px; height: 36px"
            />
          </a-tooltip>
          &nbsp;
          <span style="color: #f0f6fc">秒</span>
        </a-form-item>
        <a-form-item name="aiSrvTriggerInterval">
          <template #label>
            <span>触发间隔</span>

            <a-tooltip
              placement="top"
              :title="`产生报警后再次产生报警的时间间隔, 数值范围：${serviceForm?.intervalMin}～${serviceForm?.intervalMax}，默认值：${serviceForm?.recommend?.aiSrvTriggerInterval}`"
            >
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-tooltip
            placement="bottom"
            title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
            trigger="focus"
          >
            <a-input-number
              id="inputNumber"
              v-model:value="serviceForm.aiSrvTriggerInterval"
              :min="serviceForm?.intervalMin"
              :max="serviceForm?.intervalMax"
              style="width: 104px; height: 36px"
              :precision="0"
            />
          </a-tooltip>
          &nbsp; <span style="color: #f0f6fc">秒</span>
        </a-form-item>

        <a-form-item
          :name="['aiSrvExtraArgs', 'areaPeopleCount']"
          v-if="serviceForm?.aiSrvId === ServiceEnum.CROWD"
          :rules="[{ required: true, message: '请输入区域内人数', trigger: 'change' }]"
        >
          <template #label>
            <span>区域内人数</span>
            <a-tooltip
              placement="top"
              :title="` 设定区域内人数达到多少人则为聚众,数值范围：${serviceForm?.recommend?.aiSrvExtraArgs?.areaPeopleCountMin}～${serviceForm?.recommend?.aiSrvExtraArgs?.areaPeopleCountMax}，默认值：${serviceForm?.recommend?.aiSrvExtraArgs?.areaPeopleCount}`"
            >
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-tooltip
            placement="bottom"
            title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
            trigger="focus"
          >
            <a-input-number
              id="inputNumber"
              v-model:value="serviceForm.aiSrvExtraArgs.areaPeopleCount"
              :min="serviceForm?.aiSrvExtraArgs?.areaPeopleCountMin"
              :max="serviceForm?.aiSrvExtraArgs?.areaPeopleCountMax"
              :precision="0"
            />
          </a-tooltip>
          &nbsp; <span style="color: #f0f6fc">人</span>
        </a-form-item>
        <!--人员超限检测的区域内人数  -->
        <a-form-item
          :name="['aiSrvExtraArgs', 'overrunPeopleNumber']"
          v-if="serviceForm?.aiSrvId === ServiceEnum.NUMBER_PEOPLE"
          :rules="[{ required: true, message: '请输入区域内人数', trigger: 'change' }]"
        >
          <template #label>
            <span>区域内人数</span>
            <a-tooltip
              placement="top"
              :title="` 当区域内人数超出预设值时，则为超限,数值范围：${
                serviceForm?.recommend?.aiSrvExtraArgs?.overrunPeopleNumberMin
              }～${
                serviceForm?.recommend?.aiSrvExtraArgs?.overrunPeopleNumberMax
                  ? serviceForm?.recommend?.aiSrvExtraArgs?.overrunPeopleNumberMax
                  : '无穷'
              }，默认值：${serviceForm?.recommend?.aiSrvExtraArgs?.overrunPeopleNumber}`"
            >
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-tooltip
            placement="bottom"
            title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
            trigger="focus"
          >
            <a-input-number
              id="inputNumber"
              v-model:value="serviceForm.aiSrvExtraArgs.overrunPeopleNumber"
              :min="serviceForm?.aiSrvExtraArgs?.overrunPeopleNumberMin"
              :max="serviceForm?.aiSrvExtraArgs?.overrunPeopleNumberMax"
              :precision="0"
            />
          </a-tooltip>
          &nbsp; <span style="color: #f0f6fc">人</span>
        </a-form-item>
        <!-- <a-form-item
          :name="['aiSrvExtraArgs', 'wanderCount']"
          v-if="serviceForm?.aiSrvId === ServiceEnum.WANDER"
          :rules="[{ required: true, message: '请输入徘徊次数', trigger: 'change' }]"
        >
          <template #label>
            <span>徘徊次数</span>
            <a-tooltip
              placement="top"
              :title="` 数值范围：${serviceForm?.recommend?.aiSrvExtraArgs?.wanderCountMin}～
            ${serviceForm?.recommend?.aiSrvExtraArgs?.wanderCountMax}，
           设定同一个人重复出现在画面内多少次则为徘徊 `"
            >
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-tooltip
            placement="bottom"
            title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
            trigger="focus"
          >
            <a-input-number
              id="inputNumber"
              v-model:value="serviceForm.aiSrvExtraArgs.wanderCount"
              :min="serviceForm?.aiSrvExtraArgs?.wanderCountMin"
              :max="serviceForm?.aiSrvExtraArgs?.wanderCountMax"
              :precision="0"
            />
          </a-tooltip>
          &nbsp; <span style="color: #f0f6fc">次</span>
        </a-form-item> -->
        <a-form-item
          :name="['aiSrvExtraArgs', 'wanderTime']"
          v-if="serviceForm?.aiSrvId === ServiceEnum.WANDER || serviceForm?.aiSrvId === ServiceEnum.CROWD"
          :rules="[{ required: true, message: '请输入停留时间', trigger: 'change' }]"
        >
          <template #label>
            <span>停留时间</span>
            <a-tooltip
              placement="top"
              :title="`设定同一个人持续停留在画面内多长时间则为徘徊, 数值范围：${serviceForm?.recommend?.aiSrvExtraArgs?.wanderTimeMin}～
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ${serviceForm?.recommend?.aiSrvExtraArgs?.wanderTimeMax}
             `"
            >
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-tooltip
            placement="bottom"
            title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
            trigger="focus"
          >
            <a-input-number
              id="inputNumber"
              v-model:value="serviceForm.aiSrvExtraArgs.wanderTime"
              :min="serviceForm?.aiSrvExtraArgs?.wanderTimeMin"
              :max="serviceForm?.aiSrvExtraArgs?.wanderTimeMax"
              :precision="0"
            />
          </a-tooltip>
          &nbsp; <span style="color: #f0f6fc">秒</span>
        </a-form-item>
        <a-form-item name="aiSrvAlgorithmSensitivity" v-if="serviceForm.aiSrvAlgorithmSensitivity > -1">
          <template #label>
            <span>算法灵敏度</span>
            <a-tooltip placement="top" title="数值越小越容易触发告警">
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <div class="form-item-slider">
            <a-tooltip
              placement="bottom"
              title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
              trigger="focus"
            >
              <a-slider v-model:value="serviceForm.aiSrvAlgorithmSensitivity" :min="0" :max="100"
            /></a-tooltip>
            <a-form-item no-style>
              <a-tooltip
                placement="bottom"
                title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
                trigger="focus"
              >
                <a-input-number
                  id="inputNumber"
                  v-model:value="serviceForm.aiSrvAlgorithmSensitivity"
                  :min="0"
                  :max="100"
                  :precision="0"
                  style="width: 60px"
                />
              </a-tooltip>
            </a-form-item>
            &nbsp;&nbsp; <span style="color: #f0f6fc">%</span>
          </div>
        </a-form-item>
        <!-- 算法联动功能： 拥有人脸检测 && 指定算法  -->
        <a-form-item
          :name="['aiSrvExtraArgs', 'algoLinkageAlarm']"
          v-if="AlgoLinkServiceIds.includes(serviceForm?.aiSrvId as number) && hasFaceAiSrv"
        >
          <template #label>
            <span>算法联动</span>
            <a-tooltip placement="top" title="配置后会在当前算法检测到报警后额外进行联动算法的检测">
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-select
            v-model:value="serviceForm.aiSrvExtraArgs.algoLinkageAlarm"
            style="width: 313px; height: 38px"
            placeholder="请选择"
            :getPopupContainer="(triggerNode:any) => triggerNode.parentNode"
            @change="serviceForm.aiSrvExtraArgs.faceDetectType = 0"
            :allowClear="true"
          >
            <a-select-option :value="ServiceEnum.FACE_RECOGNITION">人脸识别检测</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :name="['aiSrvExtraArgs', 'faceDetectType']"
          :rules="[
            {
              required: serviceForm?.aiSrvId === ServiceEnum.FACE_RECOGNITION,
              message: '请选择检测范围',
              trigger: 'change',
            },
          ]"
          v-if="
            (serviceForm.aiSrvExtraArgs?.algoLinkageAlarm === ServiceEnum.FACE_RECOGNITION ||
              serviceForm?.aiSrvId === ServiceEnum.FACE_RECOGNITION) &&
            hasFaceAiSrv
          "
        >
          <template #label>
            <span>检测范围</span>
          </template>
          <a-radio-group
            class="custom-radio"
            v-model:value="serviceForm.aiSrvExtraArgs.faceDetectType"
            :options="faceDetectTypeOption"
          ></a-radio-group>
        </a-form-item>
        <!--地铁： 异物检测算法 场景单选 -->
        <a-form-item
          :name="['aiSrvExtraArgs', 'scenes']"
          :rules="[{ required: true, message: '请选择报警记录图片显示检测区域', trigger: 'change' }]"
          v-if="serviceForm?.aiSrvId === ServiceEnum.FOREIGN_BODY_DETECTION"
        >
          <template #label>
            <span>场景</span>
          </template>
          <a-radio-group class="background" v-model:value="serviceForm.aiSrvExtraArgs.scenes">
            <a-radio :value="0">场景A</a-radio>
            <a-radio :value="1">场景B</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item name="alertImageType">
          <template #label>
            <span>告警图像保存</span>
            <!-- <a-tooltip placement="top" title="保存抓拍视频文件，需要配置NVR设备">
              <i class="iconfont icon-information-line"></i>
            </a-tooltip> -->
            <a-form-item
              v-if="serviceForm?.aiSrvId === ServiceEnum.LIGHTING"
              :name="['aiSrvExtraArgs', 'alertSaveImage']"
            >
              <a-switch
                size="small"
                style="margin-left: 8px; margin-bottom: -24px"
                :checkedValue="1"
                :unCheckedValue="0"
                v-model:checked="serviceForm.aiSrvExtraArgs.alertSaveImage"
                @change="onSwitchChange"
              ></a-switch>
            </a-form-item>
            <!-- <div
              class="alert-image-type-info"
              @click.stop="$router.push('/system-layout/system-maintenance/nvr-configuration')"
            >
              <p>配置NVR设备</p>
              <i class="iconfont icon-arrow-right-s-line"></i>
            </div> -->
          </template>
          <div
            class="radio-group-wrap"
            v-if="serviceForm?.aiSrvExtraArgs?.alertSaveImage === 1 || serviceForm?.aiSrvId !== ServiceEnum.LIGHTING"
          >
            <a-radio-group class="background" :value="serviceForm.alertImageType" @change="onAlertImageTypeChange">
              <a-radio :value="0">图片</a-radio>
            </a-radio-group>
            <a-form-item
              v-if="serviceForm.alertImageType === 1 && serviceForm.nvrConfigured !== 0"
              name="nvrVideoCaptureTime"
              :rules="[{ required: true, message: '请输入抓拍前后的秒数', trigger: 'change' }]"
              class="radio-group-form-item"
            >
              <div>
                保存抓拍前后
                <a-input-number
                  id="inputNumber"
                  v-model:value="serviceForm.nvrVideoCaptureTime"
                  :min="1"
                  :max="60"
                  :precision="0"
                />
                秒视频
              </div>
            </a-form-item>
          </div>
        </a-form-item>

        <a-form-item
          :name="['aiSrvExtraArgs', 'alertSaveOriginalImage']"
          :rules="[{ required: true, message: '请选择报警记录图片显示检测区域', trigger: 'change' }]"
          v-if="serviceForm?.aiSrvExtraArgs?.alertSaveOriginalImage !== undefined"
        >
          <template #label>
            <span>同步保存报警记录图片原图</span>
          </template>
          <a-radio-group class="background" v-model:value="serviceForm.aiSrvExtraArgs.alertSaveOriginalImage">
            <a-radio :value="0">关闭</a-radio>
            <a-radio :value="1">开启</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          :name="['aiSrvExtraArgs', 'showDetectionArea']"
          :rules="[{ required: true, message: '请选择报警记录图片显示检测区域', trigger: 'change' }]"
          v-if="serviceForm?.aiSrvExtraArgs?.showDetectionArea !== undefined"
        >
          <template #label>
            <span>报警记录图片显示检测区域</span>
          </template>
          <a-radio-group class="background" v-model:value="serviceForm.aiSrvExtraArgs.showDetectionArea">
            <a-radio :value="0">关闭</a-radio>
            <a-radio :value="1">开启</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 宝鸡项目定制的区域无人算法，新增设备联动报警功能 -->
        <a-form-item
          :name="['aiSrvExtraArgs', 'algorithmLinkageAlarm']"
          :rules="[{ required: true, message: '请选择设备联动报警', trigger: 'change' }]"
          v-if="serviceForm?.aiSrvId === ServiceEnum.NOONE_AREA"
        >
          <template #label>
            <span>设备联动报警</span>
          </template>
          <a-radio-group
            class="background"
            v-model:value="serviceForm.aiSrvExtraArgs.algorithmLinkageAlarm"
            @change="onEquipmentLinkageAlarmChange"
          >
            <a-radio :value="0">关闭</a-radio>
            <a-radio :value="1">开启</a-radio>
          </a-radio-group>
          <a-form-item
            :name="['aiSrvExtraArgs', 'algorithmLinkageAlarmList']"
            :rules="[{ required: true, message: '请选择联动设备及算法' }]"
            v-if="
              serviceForm?.aiSrvExtraArgs?.algorithmLinkageAlarm === 1 ||
              serviceForm?.aiSrvId !== ServiceEnum.NOONE_AREA
            "
          >
            <a-cascader
              v-model:value="serviceForm.aiSrvExtraArgs.algorithmLinkageAlarmList"
              max-tag-count="responsive"
              :options="treeData"
              :field-names="{ label: 'label', value: 'id', children: 'children' }"
              expand-trigger="hover"
              placeholder="请选择联动设备及算法"
              allow-clear
              style="width: 313px; height: 38px; margin-top: 20px"
              show-arrow
              @change="changeAlgorithmLinkage"
            >
            </a-cascader>
          </a-form-item>
        </a-form-item>

        <!--大门未关闭算法，新增roomSize房间大小  0小1大   -->
        <a-form-item
          :name="['aiSrvExtraArgs', 'doorRoomSize']"
          v-if="serviceForm?.aiSrvId === ServiceEnum.GATE_NOTCLOSE"
          :rules="[{ required: true, message: '请选择房间大小', trigger: 'change' }]"
        >
          <template #label> <span>房间大小</span> </template>
          <a-radio-group
            class="background"
            v-model:value="serviceForm.aiSrvExtraArgs.doorRoomSize"
            @change="changeRoomSize(serviceForm.aiSrvExtraArgs.doorRoomSize)"
          >
            <a-radio :value="1">大</a-radio>
            <a-radio :value="0">小</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 宝鸡泵业项目定制的大门未关闭算法，新增房间ID字段 -->
        <!-- 大门未关闭在选择“大”房间时，房间ID点击显示11、12、13号选择项，选择房间大小未“小”时，房间ID点击显示：15、16、17号选项 -->
        <a-form-item
          v-if="serviceForm?.aiSrvId === ServiceEnum.GATE_NOTCLOSE"
          :name="['aiSrvExtraArgs', 'roomID']"
          :rules="[{ required: true, message: '请选择房间ID字段' }]"
          class="hide-required form-item"
        >
          <template #label>
            <p><span style="color: #fd4d4b">*</span>房间ID</p>
          </template>

          <a-select
            v-model:value="serviceForm.aiSrvExtraArgs.roomID"
            max-tag-count="responsive"
            placeholder="请选择房间ID字段"
            allow-clear
            :show-search="false"
            show-arrow
            style="width: 318px"
            :get-popup-container="(triggerNode: any) => {
              return triggerNode.parentNode;
            }
              "
          >
            <a-select-option
              :key="item.value"
              v-for="item in !BigOrSmall ? LargeRoomId : SmallRoomId"
              :value="item.value"
            >
              <div class="center" style="justify-content: space-between">
                {{ item.label }}
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
        <!--防护面罩算法，新增maskRoomSize房间大小  0小1大   -->
        <a-form-item
          :name="['aiSrvExtraArgs', 'maskRoomSize']"
          v-if="serviceForm?.aiSrvId === ServiceEnum.MASK"
          :rules="[{ required: true, message: '请选择房间大小', trigger: 'change' }]"
        >
          <template #label> <span>房间大小</span> </template>
          <a-radio-group class="background" v-model:value="serviceForm.aiSrvExtraArgs.maskRoomSize">
            <a-radio :value="1">大</a-radio>
            <a-radio :value="0">小</a-radio>
          </a-radio-group>
        </a-form-item>

        <!--焊接规范检测算法，新增weldingRangeWidth焊接规范范围    -->
        <a-form-item
          v-if="serviceForm?.aiSrvId === ServiceEnum.WELDING"
          :name="['aiSrvExtraArgs', 'weldingRangeWidth']"
          :rules="[{ required: true, message: '请输入焊接规范', trigger: 'change' }]"
        >
          <template #label>
            <span>焊接范围</span>

            <a-tooltip
              placement="top"
              :title="`焊接规范, 数值范围：1～3600，默认值：${serviceForm?.recommend?.aiSrvExtraArgs?.weldingRangeWidth}`"
            >
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-tooltip
            placement="bottom"
            title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
            trigger="focus"
          >
            <a-input-number
              id="inputNumber"
              v-model:value="serviceForm.aiSrvExtraArgs.weldingRangeWidth"
              :min="1"
              :max="3600"
              :precision="0"
              style="width: 104px; height: 36px"
            />
          </a-tooltip>
        </a-form-item>

        <a-form-item name="avAlarmStatus">
          <template #label>
            <span>声光报警器</span>
            <a-tooltip placement="top" :title="`外接声光报警器，并语音提示：${alarmsHintMap[serviceForm?.aiSrvId!]}`">
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-radio-group class="background" v-model:value="serviceForm.avAlarmStatus">
            <a-radio :value="0">关闭</a-radio>
            <a-radio :value="1">开启</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item name="validCycleTime">
          <template #label>
            <span>有效时间段</span>
          </template>
          <g-select-time ref="selectTimeRef" v-model:axis-list="serviceForm.validCycleTime"></g-select-time>
        </a-form-item>

        <!-- <a-form-item name="serviceForm.aiSrvExtraArgs" v-if="serviceForm?.aiSrvId === ServiceEnum.FACE_RECOGNITION">
          <template #label>
            <span>活体检测</span>
            <a-tooltip placement="top" title="判断目标是否为活体">
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-radio-group v-model:value="serviceForm.aiSrvExtraArgs.livenessDetection" @change="onLivingRadioChange">
            <a-radio :value="0">关闭</a-radio>
            <a-radio :value="1">开启</a-radio>
          </a-radio-group>
        </a-form-item> -->
        <a-form-item
          :name="['aiSrvExtraArgs', 'livenessDetectionAlgorithmSensitivity']"
          v-if="
            serviceForm?.aiSrvId === ServiceEnum.FACE_RECOGNITION && serviceForm.aiSrvExtraArgs.livenessDetection === 1
          "
          :rules="[{ required: true, message: '请输入活体灵敏度' }]"
        >
          <template #label>
            <span>活体灵敏度</span>
            <a-tooltip placement="top" title="数值越小越容易触发告警">
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <div class="form-item-slider">
            <a-tooltip
              placement="bottom"
              title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
              trigger="focus"
            >
              <a-slider
                v-model:value="serviceForm.aiSrvExtraArgs.livenessDetectionAlgorithmSensitivity"
                :min="0"
                :max="100"
              />
            </a-tooltip>
            <a-form-item no-style>
              <a-tooltip
                placement="bottom"
                title="调整算法配置，会影响抓拍准确率以及抓拍效果，请谨慎操作！"
                trigger="focus"
              >
                <a-input-number
                  id="inputNumber"
                  v-model:value="serviceForm.aiSrvExtraArgs.livenessDetectionAlgorithmSensitivity"
                  :min="0"
                  :max="100"
                  :precision="0"
                />
              </a-tooltip>
            </a-form-item>
            &nbsp;&nbsp; <span style="color: #f0f6fc">%</span>
          </div>
        </a-form-item>
        <!-- <a-form-item v-if="serviceForm?.aiSrvId === ServiceEnum.UNIFORM && showCoverallsLibrary">
          <template #label>
            <span>工服库</span>
            <a-tooltip placement="top" title="请上传不同角度和不同光照下的照片">
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <a-form-item-rest>
            <coveralls-library></coveralls-library>
          </a-form-item-rest>
        </a-form-item> -->
        <a-form-item
          :name="['aiSrvExtraArgs', 'uniformLight']"
          :rules="[{ required: true, message: '请选择使用场景' }]"
          v-if="serviceForm?.aiSrvId === ServiceEnum.UNIFORM && showCoverallsLibrary"
        >
          <template #label>
            <span>使用场景</span>
          </template>
          <a-radio-group v-model:value="serviceForm.aiSrvExtraArgs.uniformLight" @change="uniformLightChange">
            <a-radio :value="1">室外</a-radio>
            <a-radio :value="0">室内</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          :name="['aiSrvExtraArgs', 'uniformColor']"
          :rules="[{ required: true, message: '请选择工服颜色' }]"
          v-if="serviceForm?.aiSrvId === ServiceEnum.UNIFORM && showCoverallsLibrary"
        >
          <template #label>
            <span>工服颜色</span>
          </template>
          <a-select
            v-model:value="serviceForm.aiSrvExtraArgs.uniformColor"
            mode="multiple"
            max-tag-count="responsive"
            placeholder="请选择工服颜色"
            allow-clear
            :showSearch="false"
            showArrow
            style="width: 318px"
            :get-popup-container="(triggerNode: any) => {
              return triggerNode.parentNode;
            }
              "
          >
            <a-select-option
              :value="item.value"
              v-for="item in colorList"
              :get-popup-container="(triggerNode: any) => {
              return triggerNode.parentNode;
            }
              "
            >
              <div class="center" style="justify-content: space-between">
                {{ item.label }}
                <div class="color-box" :style="{ background: item.color }"></div>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item v-if="serviceForm?.aiSrvId === ServiceEnum.FACE_RECOGNITION && showFaceLibrary">
          <template #label>
            <span>人脸库</span>
            <a-tooltip placement="top" title="请上传不同角度和不同光照下的照片">
              <i class="iconfont icon-information-line"></i>
            </a-tooltip>
          </template>
          <face-library></face-library>
        </a-form-item> -->
      </a-form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { FormInstance, RadioChangeEvent } from 'ant-design-vue'
import { Rule } from 'ant-design-vue/es/form'
import { computed, ref, watch, reactive, watchEffect } from 'vue'
import { cloneDeep } from 'g6-fn'
// import CoverallsLibrary from './coveralls-library.vue'
// import FaceLibrary from './face-library.vue'
import {
  complexColorList,
  evenColorList,
  ServiceEnum,
  alarmsHintMap,
  AlgoLinkServiceIds,
  LargeRoomId,
  SmallRoomId,
} from '../config'
import { confirm } from '@/utils/antd.util'
import { useRouter } from 'vue-router'
import { aiApi, equipmentApi } from '@/services/api'
import { deepEqual } from '@/utils/utils'
defineProps({
  showFaceLibrary: {
    type: Boolean,
    default: true,
  },
  showCoverallsLibrary: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  hasFaceAiSrv: {
    type: Boolean,
    default: false,
  },
})

const colorList = computed(() => {
  const mode = serviceForm.value?.aiSrvExtraArgs?.uniformLight
  return mode === 1 ? evenColorList : complexColorList
})

const router = useRouter()

/**
 * 表单
 */
interface ServiceForm {
  id?: number
  aiSrvId?: number | null
  aiSrvStatus?: number
  aiSrvTriggerInterval: number
  aiSrvDelayTriggerSeconds: number
  aiSrvAlgorithmSensitivity: number
  alertImageType: number
  avAlarmStatus: number
  validCycleTime: any[]
  aiSrvExtraArgs: any
  aiSrvAlarmName: string
  intervalMin?: number
  intervalMax?: number
  delayMin?: number
  delayMax?: number
  recommend?: any
  nvrConfigured?: number
  nvrVideoCaptureTime?: number
}
const serviceFormRef = ref<FormInstance>()
const faceDetectTypeOption = reactive([
  { label: '黑名单+白名单', value: 3 },
  { label: '黑名单', value: 0 },
  { label: '白名单', value: 1 },
])
const serviceForm = ref<ServiceForm>({
  validCycleTime: [],
  aiSrvTriggerInterval: 0,
  aiSrvDelayTriggerSeconds: 0,
  aiSrvAlgorithmSensitivity: 0,
  alertImageType: 0,
  avAlarmStatus: 0,
  aiSrvExtraArgs: null,
  aiSrvAlarmName: '',
  recommend: null,
  nvrConfigured: 0,
  nvrVideoCaptureTime: 0,
})
const serviceRules: Record<string, Rule[]> = {
  validCycleTime: [{ required: false, message: '请选择有效时间段', trigger: 'change' }],
  aiSrvTriggerInterval: [{ required: true, message: '请输入触发间隔', trigger: 'change' }],
  aiSrvDelayTriggerSeconds: [{ required: true, message: '请输入触发延迟', trigger: 'change' }],
  aiSrvAlgorithmSensitivity: [{ required: true, message: '请输入算法灵敏度', trigger: 'change' }],
  alertImageType: [{ required: true, message: '请选择告警图像保存', trigger: 'change' }],
  avAlarmStatus: [{ required: true, message: '请选择声光报警器', trigger: 'change' }],
  serviceName: [{ required: true, message: '请选择活体检测', trigger: 'change' }],
  aiSrvAlarmName: [{ required: true, message: '请输入报警名称', trigger: 'blur' }],
}

// 是否首次加载
let isFirst = true
watch(
  () => serviceForm.value,
  () => {
    if (isFirst) {
      isFirst = false
      return
    }
  },
  {
    deep: true,
  },
)
/**
 * 改变使用场景值
 */

const uniformLightChange = (e: RadioChangeEvent) => {
  // 保存工服颜色值
  if (e.target.value === oldFormData.aiSrvExtraArgs.uniformLight) {
    serviceForm.value.aiSrvExtraArgs.uniformColor = oldFormData.aiSrvExtraArgs.uniformColor
  } else {
    serviceForm.value.aiSrvExtraArgs.uniformColor = [8]
  }
}
/**
 * 获取表单数据
 */
const resetFormNewVal = () => {
  let newFormData = cloneDeep(serviceForm.value)
  if (!newFormData || !newFormData.aiSrvExtraArgs) {
    return
  }

  // 特殊处理算法联动值：把 null 转为 -1
  if (newFormData.aiSrvExtraArgs.hasOwnProperty('algoLinkageAlarm')) {
    newFormData.aiSrvExtraArgs.algoLinkageAlarm =
      newFormData.aiSrvExtraArgs.algoLinkageAlarm === null || newFormData.aiSrvExtraArgs.algoLinkageAlarm === undefined
        ? -1
        : newFormData.aiSrvExtraArgs.algoLinkageAlarm
  }
  return newFormData
}
const getFormData = async () => {
  try {
    await serviceFormRef.value?.validate()
    let newFormData = resetFormNewVal()
    return Promise.resolve(newFormData)
  } catch (error) {
    return Promise.reject(error)
  }
}

const onAlertImageTypeChange = (e: any) => {
  const value = e.target.value as number
  if (value === 1 && serviceForm.value.nvrConfigured === 0) {
    confirm({
      title: '未配置NVR设备，无法使用此功能，是否去配置NVR？',
      onOk: () => {
        router.push('/system-layout/system-maintenance/nvr-configuration')
      },
    })
    return
  }
  if (value === 0 && serviceForm.value.nvrConfigured === 1) {
    confirm({
      title: '关闭后无法提供抓拍视频，确定是否关闭？',
      onOk: () => {
        serviceForm.value.alertImageType = value
      },
    })
    return
  }
  serviceForm.value.alertImageType = value
}

/**
 * 设置服务类型
 */
const selectTimeRef = ref<any>()

/**
 * 设置表单数据
 */
const devicesAlgorithmID = ref()
const oldFormData = reactive<ServiceForm>({} as ServiceForm) //老数据 用于部分值保留
const setFormData = (dataVal: ServiceForm) => {
  let data = cloneDeep(dataVal)
  // 时间边界时间设置
  data.nvrVideoCaptureTime =
    (data.nvrVideoCaptureTime as number) > 60
      ? 60
      : (data.nvrVideoCaptureTime as number) < 1
      ? 1
      : data.nvrVideoCaptureTime

  if (typeof data.aiSrvExtraArgs !== 'object') {
    data.aiSrvExtraArgs = JSON.parse(data.aiSrvExtraArgs)
  }

  // 特殊处理算法联动的值 -1
  if (data.aiSrvExtraArgs.hasOwnProperty('algoLinkageAlarm')) {
    data.aiSrvExtraArgs.algoLinkageAlarm =
      data.aiSrvExtraArgs.algoLinkageAlarm === -1 ? null : data.aiSrvExtraArgs.algoLinkageAlarm
  }
  serviceForm.value = data
  Object.assign(oldFormData, cloneDeep(data))
  selectTimeRef.value?.setAxisList(data.validCycleTime)
  devicesAlgorithmID.value = data.aiSrvId
}

/**
 * 同步获取表单数据
 */
const getFormDataSync = () => {
  let newFormData = resetFormNewVal()
  return newFormData
}

/**
 * 获取表单是否有变化
 */
const getIsChange = async () => {
  const { data } = await equipmentApi.resetDefaultAiConfig(serviceForm.value.id as number)
  let newFormData = resetFormNewVal()
  console.log(newFormData)
  console.log(data)

  return !deepEqual(newFormData, data, [
    'deviceAreaId',
    'deviceId',
    'id',
    'aiSrvName',
    'selected',
    'sort',
    'useDefaultConfig',
  ])
}

/**
 * 灯光检测
 * 报警图片开关按钮
 */
const onSwitchChange = async () => {
  if (serviceForm.value.aiSrvExtraArgs.alertSaveImage === 0) {
    confirm({
      content: '关闭该功能后，将不会保存该算法报警以后的图片以及视频，但是不会影响该算法正常运行！',
      onCancel: () => {
        serviceForm.value.aiSrvExtraArgs.alertSaveImage = 1
      },
    })
  }
}

// ===========================================宝鸡项目===================================》
/**
 * 区域无人
 * 设备联动报警开启/关闭
 */
const treeData = ref([])
const BigOrSmall = ref<boolean | number>(true)
const onEquipmentLinkageAlarmChange = async (_checked: any) => {
  let content =
    serviceForm.value.aiSrvExtraArgs.algorithmLinkageAlarm === 1
      ? '开启后，请选择联动报警的设备以及算法。选择后，当前算法将会根据选择的对应设备下算法抓拍结果，去判断是否启动抓拍'
      : '关闭后，将和联动设备解绑，同时恢复单独检测模式'
  confirm({
    content: content,
    onCancel: () => {
      serviceForm.value.aiSrvExtraArgs.algorithmLinkageAlarm = _checked.target.value === 1 ? 0 : 1
    },
  })
}
// 改变房间大小
const changeRoomSize = (size: string | number) => {
  BigOrSmall.value = size ? 0 : 1
  serviceForm.value.aiSrvExtraArgs.roomID = size ? 10 : 15
}

const getDevicesAlgorithm = async () => {
  let { data } = await aiApi.getDevicesAlgorithms({ aiSrvType: devicesAlgorithmID.value })
  treeData.value = data
}

// 递归筛选
const findObjectById = (data: any, id: string): any => {
  for (let i = 0; i < data.length; i++) {
    const obj = data[i]

    if (obj.id === id) {
      return obj
    }
    if (obj?.children && obj?.children?.length > 0) {
      const result = findObjectById(obj.children, id)
      if (result) {
        return result
      }
    }
  }
  return null
}

const changeAlgorithmLinkage = (value: any): void => {
  value?.forEach((item: any) => {
    const re = findObjectById(treeData.value, item[item.length - 1])

    if (re?.children) {
      re.children.forEach((itemChild: any) => {
        serviceForm.value.aiSrvExtraArgs.algorithmLinkageAlarmList.push(itemChild?.id as never)
      })
    } else {
      // serviceForm.value.aiSrvExtraArgs.algorithmLinkageAlarmList.push(re?.id as never)
    }
  })
}

watchEffect(() => {
  if (devicesAlgorithmID.value === 34) {
    getDevicesAlgorithm()
  }
  if (devicesAlgorithmID.value === 29) {
    BigOrSmall.value = serviceForm.value?.aiSrvExtraArgs?.doorRoomSize ? 0 : 1
  }
})
// ===========================================宝鸡项目   END===================================》

defineExpose({
  getFormData,
  setFormData,
  getFormDataSync,
  getIsChange,
})
</script>

<style lang="less" scoped>
.custom-radio {
  :deep(.ant-radio-wrapper) {
    margin-right: 24px !important;
  }
}

:deep(.ant-radio-checked) {
  .ant-radio-inner {
    border-color: #1a6ff3 !important;
  }
}

.service-form {
  .ant-form-item {
    margin-bottom: 32px !important;
  }

  .form-item-slider {
    display: flex;
    align-items: center;

    .ant-slider {
      width: 231px;
      margin-right: 13px;
    }
  }

  .iconfont {
    margin-left: 8px;
    color: @text4;
  }

  .alert-image-type-info {
    display: flex;
    align-items: center;
    margin-left: 12px;
    color: rgba(100, 154, 240, 1);
    cursor: pointer;

    > i {
      color: rgba(100, 154, 240, 1);
      transform: translateX(-6px) translateY(1px);
    }
  }

  .radio-group-wrap {
    display: flex;
    align-items: center;
    gap: 0 12px;

    .radio-group-form-item {
      margin-bottom: 0 !important;
      color: @text2;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
    }
  }
}

.color-box {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

// .ant-radio-group {
//   .ant-radio-wrapper {
//     border-radius: 8px;
//     border: 1px solid @border3;
//     background: rgba(26, 111, 243, 0.08);
//     box-shadow: @shadow-ss;
//     padding: 8px 16px;
//     margin-right: 10px;
//   }
// }
</style>
