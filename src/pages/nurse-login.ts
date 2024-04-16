import hash from "../components/util/url-hash"
import Database from "../managers/database"

export default class NurseLoginPage {
	static #instance: NurseLoginPage

	constructor() {
        if (NurseLoginPage.#instance) return
	}

    static get instance() {
        if (!this.#instance) 
            this.#instance = new NurseLoginPage()

        return this.#instance
    }

    init() {
        const el = document.getElementById('nurse-login') as HTMLFormElement
        if (!el) return

        el.onsubmit = e => {
            e.preventDefault()

            const password = (el.querySelector('#password') as HTMLInputElement).value
            const name = document.querySelector('#name')?.innerHTML

            const nurse_password = Database.instance.nurses.find(nurse => nurse.data.name === name)?.data.password

            if (password === nurse_password) {
                console.log('Correct password!')
                const name_param = hash().params.find(param => param[0] === 'name')

                if (!name_param) return

                const name = name_param[1]
                window.location.hash = `nurse-home?name=${name}`
            }
        }
    }
}