import { vi, describe, it, expect } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ElementPlus from 'element-plus'

import FormGenerator from '../src/components/FormGenerator.vue'
import { formatFields } from '../src/utils/formatFields'

const componentWrapper = (component: any, props: any): VueWrapper => {
	return mount(component, {
		props,
		global: {
			plugins: [ElementPlus]
		}
	})
}

describe('Form Generator Test', () => {
	it('should generate string type form', function () {
		const fieldItem = formatFields({
			'name': {
				'len_min': 1,
				'type': 'string',
				'indexed': true,
				'unique': true
			}
		})
		const wrapper = componentWrapper(FormGenerator, {
				field: fieldItem,
				value: fieldItem.value
			}
		)
		expect(wrapper.find('input').exists()).toBe(true)
	})

	it('should hide item when its auto field is true', function () {
		const fieldItem = formatFields({
			id: {
				'uuid': true,
				'type': 'string',
				'auto': true,
				'len_min': 1
			}
		})
		const wrapper = componentWrapper(FormGenerator, {
				field: fieldItem,
				value: fieldItem.value
			}
		)
		expect(wrapper.find('input').exists()).toBe(false)
	})

	it('should generate selection type form', function () {
		const fieldItem = formatFields({
			path_handling: {
				'len_min': 1,
				'type': 'string',
				'default': 'v0',
				'one_of': [
					'v0',
					'v1'
				]
			}
		})
		const wrapper = componentWrapper(FormGenerator, {
				field: fieldItem,
				value: fieldItem.value
			}
		)
		let select = wrapper.find('.el-select')
		expect(select.exists()).toBe(true)
	})

	it('should generate checkbox type form', function () {
		const fieldItem = formatFields({
			strip_path: {
				'required': true,
				'type': 'boolean',
				'default': true
			}
		})
		const wrapper = componentWrapper(FormGenerator, {
				field: fieldItem,
				value: fieldItem.value
			}
		)
		let checkbox = wrapper.find('.el-checkbox')
		expect(checkbox.exists()).toBe(true)
	})

	it('should generate integer type form', function () {
		const fieldItem = formatFields({
			regex_priority: {
				'default': 0,
				'type': 'integer'
			}
		})
		const wrapper = componentWrapper(FormGenerator, {
				field: fieldItem,
				value: fieldItem.value
			}
		)
		let numInput = wrapper.find('.el-input-number')
		expect(numInput.exists()).toBe(true)
	})

	it('should generate set-record type form', async function () {
		const fieldItem = formatFields({
			'sources': {
				'type': 'set',
				'elements': {
					'entity_checks': [
						{
							'at_least_one_of': [
								'ip',
								'port'
							]
						}
					],
					'type': 'record',
					'fields': [
						{
							'ip': {
								'type': 'string'
							}
						},
						{
							'port': {
								'type': 'integer',
								'between': [
									0,
									65535
								]
							}
						}
					]
				}
			}
		})
		const wrapper = componentWrapper(FormGenerator, {
				field: fieldItem,
				value: fieldItem.value
			}
		)

		await wrapper.find('.add-sub-entity').trigger('click')
		expect(wrapper.find('section.sub-entity').exists()).toEqual(true)

		const label = wrapper.findAll('section.sub-entity .el-form-item__label')
		expect(label[0].text()).toEqual('ip')
		expect(label[1].text()).toEqual('port')
	})

	it('should generate map type form', async function () {
		const fieldItem = formatFields({
			headers: {
				'keys': {
					'match_none': [
						{
							'err': 'cannot contain \'host\' header, which must be specified in the \'hosts\' attribute',
							'pattern': '^[Hh][Oo][Ss][Tt]$'
						}
					],
					'type': 'string'
				},
				'type': 'map',
				'values': {
					'elements': {
						'type': 'string'
					},
					'type': 'array'
				}
			}
		})
		const wrapper = componentWrapper(FormGenerator, {
				field: fieldItem,
				value: fieldItem.value
			}
		)
		const keyInput = wrapper.find('.map-key .el-input__inner')
		expect(keyInput.exists()).toBe(true)

		await keyInput.setValue('Content-Type')
		await wrapper.find('.add-header').trigger('click')
		expect(wrapper.find('.header-key-0').text()).toEqual('Content-Type')

		const valueInput = wrapper.find('.el-input.map-value-0')
		expect(valueInput.exists()).toBe(true)
	})
})
