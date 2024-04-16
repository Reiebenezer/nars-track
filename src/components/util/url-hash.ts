export default function hash() {
    const hash = window.location.hash.slice(1)
    if (!hash) return {
        url: '',
        params: []
    }

    const [ url, param_str ] = hash.split('?')
    return {
		url,
		params: param_str.split('&').map(param => param.split('=').map(str => decodeURIComponent(str))),
	}
}