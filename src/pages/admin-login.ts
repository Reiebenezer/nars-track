export default class AdminLoginPage {
    static #instance: AdminLoginPage

	constructor() {
        if (AdminLoginPage.#instance) return
	}

    static get instance() {
        if (!this.#instance) 
            this.#instance = new AdminLoginPage()

        return this.#instance
    }

    init() {
        const form = document.getElementById('admin-login')! as HTMLFormElement
        (form.querySelector('input#password') as HTMLInputElement).focus()

        form.onsubmit = e => {
            e.preventDefault()

            const password = (form.querySelector('input#password') as HTMLInputElement).value

            if (password === 'NarsTrack2024') {
                console.log('Correct Password!')
                
                window.location.hash = 'admin-home'
            } 
            else form.querySelector('.error-text')?.classList.remove('hidden')
        }
    }
}