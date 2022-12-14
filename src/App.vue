<template>
  <section class="button-group">
    <el-button class="fetch-schema service" @click="entity = 'services'">Services</el-button>
    <el-button class="fetch-schema routes" @click="entity = 'routes'">Routes</el-button>
    <el-button class="fetch-schema routes" @click="entity = 'consumers'">Consumers</el-button>
    <el-button class="fetch-schema routes" @click="entity = 'plugins'">Plugins</el-button>
  </section>

  <el-form label-position="top" :rules="rules">
    <template v-for="item in fieldsItems" :key="item.field_name">
      <FormGenerator :field="item" v-model:value="item.value" />
    </template>
  </el-form>

  <section v-show="fieldsItems.length > 0" class="footer">
    <el-button type="primary" @click="verifyEntityInput">Verify Input</el-button>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, ComputedRef, reactive, Ref, ref, watch } from 'vue'
import FormGenerator from './components/FormGenerator.vue'
import { ElNotification, FormRules } from 'element-plus'
import { formatFields } from './utils/formatFields'
import { validatorGenerator } from './utils/validatorGenerator'

const schemas: Ref<{ fields: { [filed_name: string]: { [key: string]: any } }[] }> = ref({ fields: [] })

const entity: Ref<string> = ref('')
const fetchSchemas = (path: string) => {
  axios.get(`http://localhost:8001/schemas/${path}`).then(res => {
    schemas.value = res.data
  }).catch(error => {
    console.error(error)
  })
}
watch(entity, (newValue) => {
  fetchSchemas(entity.value)
})
const verifyEntityInput = () => {
  const data = fieldsItems.value.map((item) => ({ [item.field_name]: item.value })).reduce((res, item) => Object.assign(res, item), {})
  console.log(data)
  axios.post(`http://localhost:8001/schemas/${entity.value}/validate`, data).then((res) => {
    console.log(res)
  }).catch((err) => {
    ElNotification({
      title: 'Warning',
      message: err.response.data.message,
      type: 'warning',
      duration: 0
    })
  })
}

const fieldsItems: ComputedRef<{ field_name: string, value: any, [key: string]: any }[] | Array<any>> = computed(() => schemas.value.fields.map((item) => formatFields(item)))

const fieldItemsValidation: Ref<{}> = ref({})

watch(fieldsItems, (newValue) => {
  newValue.forEach((schemaItem) => {
    if (schemaItem.auto) return

    Object.assign(fieldItemsValidation.value, {
      [schemaItem.field_name]: [{
        validator: validatorGenerator(schemaItem), trigger: ['change', 'blur']
      }]
    })
  })
})

const rules = reactive<FormRules>(fieldItemsValidation.value)
</script>

<style scoped>
.button-group {
  width: 100%;
  height: 36px;
  padding: 12px;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(250, 235, 215, 0.6);
  backdrop-filter: blur(10px);
  z-index: 2;
}

.el-form {
  margin: 36px auto 0;
}
</style>
