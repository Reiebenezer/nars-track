import { BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs";
import hash from "../components/util/url-hash"
import { HomePage, NurseLoginPage, NurseHomePage, AdminLoginPage, AdminHomePage, AdminAddNursePage, AdminAddPatientPage, AdminPatientListPage, AdminViewPatientPage } from "../pages"
import anime from 'animejs';
import AdminViewMeasuredDataPage from "../pages/admin-viewmeasureddata";


export default class Router {
    static #instance: Router

    container = document.getElementById('query-replace')!
    constructor() {
        if (Router.#instance) return
    }

    async init() {
        const hashChange = async () => {
            const { url, params } = hash()
            const html = await this.#fetchHtml(url, params)
            // console.log(html)
            this.#handleRoutes(hash().url, html)
        }

        hashChange()
		window.onhashchange = hashChange

        document.getElementById('go-back')?.addEventListener('click', () => {
            history.back()
        })
    }

    #handleRoutes(hash: string, html: string) {
        const header = document.querySelector('header')!
        header.className = header.className.replace(/route-[A-Za-z-]+/g, `route-${hash || 'index'}`)


        this.container.style.pointerEvents = 'none'
        anime({
            targets: this.container,
            opacity: [1, 0],
            translateX: ['0', '-15em'],
            easing: 'easeOutQuint',
            duration: 600,
            complete: () => {
                this.container.innerHTML = html
                this.container.style.pointerEvents = ''


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
        
                    case 'admin-login':
                        AdminLoginPage.instance.init()
                        break
        
                    case 'admin-home':
                        AdminHomePage.instance.init()
                        break
        
                    case 'admin-addnurse':
                        AdminAddNursePage.instance.init()
                        break
        
                    case 'admin-addpatient':
                        AdminAddPatientPage.instance.init()
                        break
        
                    case 'admin-patientlist':
                        AdminPatientListPage.instance.init()
                        break

                    case 'admin-viewpatient':
                        AdminViewPatientPage.instance.init()
                        break

                    case 'admin-viewmeasureddata':
                        AdminViewMeasuredDataPage.instance.init()
                        break
                }

                anime({
                    targets: this.container,
                    translateX: ['15em', 0],
                    opacity: [0, 1],
                    easing: 'easeOutQuint',
                    duration: 600,
                })
            }
        })
    }

    static get instance() {
        if (!this.#instance) 
            this.#instance = new Router()

        return this.#instance
    }

    async #fetchHtml(url: string, params: string[][]) {
        // let html = await (await fetch(`/src/routes/${url || 'index'}.html`)).text()
        let html = await readTextFile(`routes/${url || 'index'}.html`, { baseDir: BaseDirectory.Resource})
        // console.log(html)

        // if (await (await fetch(`/src/routes/${url || 'index'}.html`)).text() === await (await fetch('/')).text()) 
        //     html = await (await fetch(`/src/routes/404.html`)).text()

        ;[...html.matchAll(/\{?\?(param=\w+)\}/g)].forEach(param => {
            const paramKey = param[1].replace('param=', '')
            const paramURLMap = params.find(param => param[0] === paramKey)

            if (!paramURLMap) return
            const paramValue = decodeURIComponent(paramURLMap[1])

            html = html.replace(param[0], paramValue)
        })

        // return html.slice(html.indexOf('\n') + 1)
        return html
    }
}