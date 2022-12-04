<template>
  <template v-if="!hidden">
    <el-form-item :label="itemLabel" :prop="field.field_name">
      <template v-if="formType === 'input'">
        <el-input v-model="itemValue" :name="field.field_name" />
      </template>
      <template v-else-if="formType === 'integer'">
        <el-input-number
          v-model="itemValue"
          :name="field.field_name"
          :min="field.between?.[0]"
          :max="field.between?.[1]"
          :controls="false"
        />
      </template>
      <template v-else-if="formType === 'checkbox'">
        <el-checkbox v-model="itemValue" :label="field.field_name" />
      </template>
      <template v-else-if="formType === 'select'">
        <el-select v-model="itemValue">
          <el-option
            v-for="item in field.one_of"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </template>
      <template v-else-if="formType === 'record'">
        <template v-for="(item) in itemValue" :key="item.key">
          <section class="sub-entity">
            <el-form-item label="ip">
              <el-input v-model="item.ip" />
            </el-form-item>
            <el-form-item label="port">
              <el-input v-model="item.port" />
            </el-form-item>
          </section>
        </template>
        <el-button class="add-sub-entity" @click="addSetRecordItem">Add a {{ field.field_name }} sub entity</el-button>
      </template>
      <template v-else-if="formType === 'map'">
        <template v-for="(item, index) in itemValue" :key="item.key">
          <section class="map-item">
            <p :class="`header-key-${index}`">{{ item.key }}</p>
            <el-input :class="`map-value-${index}`" placeholder="Please input header value" v-model="item.value" />
          </section>
        </template>
        <section class="header-generator">
          <el-input class="map-key" placeholder="Please input header key" v-model="mapItem.key" />
          <el-button class="add-header" @click="addMapItem">Add a Header</el-button>
        </section>
      </template>
    </el-form-item>
  </template>
</template>

<script setup lang="ts">
import { computed, Ref, ref, watch } from 'vue'
import { formatFields } from '../utils/formatFields'

const { field, value } = defineProps<{
  field: {
    field_name: string,
    type: string,
    [key: string]: any
  },
  value: any
}>()

const emit = defineEmits<{
  (e: 'update:value', value: any): void
}>()

const itemLabel = computed(() => formType.value !== 'checkbox' && field.field_name)
const itemValue = ref(value)
watch(itemValue, (newValue) => {
  emit('update:value', newValue)
})

const subFields: Ref<any[]> = ref([])
const addSetRecordItem = () => {
  itemValue.value.push({
    ip: '',
    port: 0
  })
}

const mapItem = ref({ key: '', value: '' })
const addMapItem = () => {
  itemValue.value.push(JSON.parse(JSON.stringify(mapItem.value)))
  mapItem.value = { key: '', value: '' }
}

const formType = computed(() => {
  if (field.default) {
    itemValue.value = field.default
  }
  const fields = Object.keys(field)
  if (fields.includes('one_of')) {
    return 'select'
  }
  switch (field.type) {
    case 'array':
    case 'set':
      if (field.elements.type === 'string') {
        return 'input'
      }
      if (field.elements.type === 'record') {
        itemValue.value = []
        subFields.value = field.elements.fields.map((item: any) => formatFields(item))
        return 'record'
      }
      return ''
    case 'string':
      return 'input'
    case 'integer':
      return 'integer'
    case 'boolean':
      return 'checkbox'
    case 'map':
      itemValue.value = []
      return 'map'
  }
})

// plugins' config field is record type
const hiddenType = ['record', 'foreign']
const hidden = computed(() => field.auto || hiddenType.includes(field.type))
</script>

<style lang="scss">
.el-form-item {
  .el-form-item__label {
    font-size: 24px;
    font-weight: 600;
  }

  .el-checkbox {
    * {
      font-size: 16px;
    }

    .el-checkbox__label {
      font-weight: 600;
    }
  }

  .el-form-item__content {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    .map-item {
      position: relative;
      width: 100%;
      padding-left: 20px;

      p {
        margin: 8px auto;
        font-size: 16px;
        font-weight: 500;
        line-height: 1;
        text-align: left;
      }

      &::before {
        content: ' ';
        position: absolute;
        height: calc(100% - 8px);
        width: 1px;
        left: 8px;
        top: 8px;
        background-color: #7f7f7f;
      }
    }

    .header-generator {
      display: flex;
      margin: 8px auto;

      .el-button {
        margin-left: 8px;
      }
    }
  }

  .sub-entity {
    margin-bottom: 8px;
    padding: 12px;
    border: 1px solid #7f7f7f;
    border-radius: 6px;
  }
}
</style>