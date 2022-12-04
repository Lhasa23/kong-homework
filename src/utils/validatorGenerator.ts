const subsetValidator = (currentValue: string, fieldItem: any, callback: any) => {
	// one_of, mutually_exclusive_subsets
	const testEveryItemValue = (testFn: (v: string) => any): any[] => {
		return currentValue.split(',').map((item: string) => item.trim()).filter((item: string) => item).map(testFn)
	}
	const itemElements = fieldItem.elements
	if (itemElements.one_of) {
		testEveryItemValue((v: string) => {
			if (!itemElements.one_of.includes(v)) {
				return callback(new Error('value is not included in valid sets'))
			}
		})
	}
	if (fieldItem.mutually_exclusive_subsets) {
		const exclusiveCurrentSet = testEveryItemValue((v: string) => {
			for (let index in fieldItem.mutually_exclusive_subsets) {
				const subset = fieldItem.mutually_exclusive_subsets[index]
				if (subset.includes(v)) return index
			}
		})
		if ([...new Set(exclusiveCurrentSet)].length > 1)
			return callback(new Error('value should be the same type of protocols'))
	}

	// match_all, match_any, match_none
	if (itemElements.match_all) {
		itemElements.match_all.forEach((item: any) => {
			const reg = new RegExp(item.pattern)
			testEveryItemValue((v: string) => {
				if (!reg.test(v)) return callback(new Error(item.err))
			})
		})
	}
	if (itemElements.match_none) {
		itemElements.match_none.forEach((item: any) => {
			const reg = new RegExp(item.pattern)
			testEveryItemValue((v: string) => {
				if (reg.test(v)) return callback(new Error(item.err))
			})
		})
	}
	if (itemElements.match_any) {
		const regResult = testEveryItemValue((v: string) => {
			return itemElements.match_any.patterns.map((pattern: string) => {
				const reg = new RegExp(pattern)
				return reg.test(v)
			}).includes(true)
		})
		if (!regResult.every((pass: boolean) => pass)) {
			return callback(new Error(itemElements.match_any.err))
		}
	}
}
export const validatorGenerator = (fieldItem: any) => (rule: any, value: any, callback: any) => {
	const currentValue = fieldItem.value

	// set/array type fields and string type elements
	if (fieldItem.elements && fieldItem.elements.type === 'string') {
		return subsetValidator(currentValue, fieldItem, callback)
	}

	if (fieldItem.type === 'string') {
		if (!currentValue) return callback(new Error(`${fieldItem.field_name} can't be empty`))
	}

	if (fieldItem.one_of && !fieldItem.one_of.includes(currentValue)) {
		return callback(new Error(`value is not included in valid sets`))
	}

	if (fieldItem.match_none) {
		fieldItem.match_none.forEach((item: any) => {
			const reg = new RegExp(item.pattern)
			if (reg.test(currentValue)) return callback(new Error(item.err))
		})
	}

	if (fieldItem.starts_with) {
		if (currentValue[0] !== fieldItem.starts_with) return callback(new Error(`value must start with '${fieldItem.starts_with}'`))
	}
}