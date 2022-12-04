export function formatFields (fieldItem: { [p: string]: { [p: string]: any } }): { field_name?: string, value?: any, [key: string]: any } {
	if (!fieldItem) return []
	const fieldName = Object.keys(fieldItem)[0]
	return {
		field_name: fieldName,
		...fieldItem[fieldName],
		value: ''
	}
}