export default class Scanner {
	static #instance: Scanner

    #ws?: WebSocket
    connected = false
    
	constructor() {
		if (Scanner.#instance) return
	}

	static get instance() {
		if (!this.#instance) this.#instance = new Scanner()

		return this.#instance
	}

    init(ip: string, port: number) {
        this.#ws = new WebSocket(`ws://${ip}:${port}`)
        console.log('connecting to websocket...')

        return new Promise((resolve, reject) => {
            if (!this.#ws) return reject('Websocket not initialized.')

            this.#ws.onopen = () => {
                this.connected = true
				resolve(`Successfully connected to ws://${ip}:${port}`)
            }

            this.#ws.onerror = () => {
                reject(`Unable to connect to ws://${ip}:${port}`)
            }
        })
    }

    get ws() {
        if (!this.#ws) throw new ReferenceError('You did not call init!')
        return this.#ws
    }

    waitMessage() {
        return new Promise((resolve: (data: string) => void) => {
            this.ws.addEventListener('message', e => resolve(e.data))
        })
    }
}