import Nurse from '../components/nurse'
import Database from '../managers/database'

export default class HomePage {
	static #instance?: HomePage

	constructor() {
		if (HomePage.#instance) return

		
	}

	static get instance() {
		if (!this.#instance) this.#instance = new HomePage()

		return this.#instance
	}

	init() {
		const nurses = Database.instance.nurses

		nurses.forEach(nurse => 
			nurse.avatar.parent(
				document.getElementById('nurse-login-profiles')!
			)
		)

		return this
	}
}
