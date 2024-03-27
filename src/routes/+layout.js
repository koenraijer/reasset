export async function load({ fetch }) {
	const response = await fetch('api')
	const data = await response.json()

	return { data } // Featured may be used in the future
}
