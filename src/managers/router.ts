import hash from "../components/util/url-hash"
import HomePage from "../pages/home"
import NurseHomePage from "../pages/nurse-home"
import NurseLoginPage from "../pages/nurse-login"

export default class Router {
    static #instance: Router

    container = document.getElementById('query-replace')!
    constructor() {
        if (Router.#instance) return
    }

    async init() {
        const hashChange = async () => {
            const { url, params } = hash()
            this.container.innerHTML = await this.#fetchHtml(url, params)
    
            this.#handleRoutes(hash().url)
        }

        hashChange()
		window.onhashchange = hashChange
    }

    #handleRoutes(hash: string) {
        switch(hash) {
            case '':
                HomePage.instance.init()
                break

            case 'nurse-login':
                NurseLoginPage.instance.init()
                break

            case 'nurse-home':
                NurseHomePage.instance.init()
                break
        }
    }

    static get instance() {
        if (!this.#instance) 
            this.#instance = new Router()

        return this.#instance
    }

    async #fetchHtml(url: string, params: string[][]) {
        let html = await (await fetch(`/src/routes/${url || 'index'}.html`)).text()

        if (!html) html = await (await fetch(`/src/routes/404.html`)).text()

        ;[...html.matchAll(/\{?\?(param=\w+)\}/g)].forEach(param => {
            const paramKey = param[1].replace('param=', '')
            const paramURLMap = params.find(param => param[0] === paramKey)

            if (!paramURLMap) return
            const paramValue = decodeURIComponent(paramURLMap[1])

            html = html.replace(param[0], paramValue)
        })

        return html.slice(html.indexOf('\n') + 1)
    }
}