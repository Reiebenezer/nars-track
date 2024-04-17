import UtilElement from "../components/util/element"
import Database from "../managers/database"

export default class AdminHomePage {
    static #instance: AdminHomePage

	constructor() {
        if (AdminHomePage.#instance) return
	}

    static get instance() {
        if (!this.#instance) 
            this.#instance = new AdminHomePage()

        return this.#instance
    }

    init() {
        const nurseList = document.getElementById('registered-nurses')!

        Database.instance.nurses.forEach(nurse => {
            const listItem = new UtilElement('li')

            listItem
                .html(`${nurse.data.name}<br><small>${nurse.data.title}</small>`)
                .append(
                    new UtilElement('button')
                        .class('icon')
                        .append(new UtilElement('span').class('ph-bold', 'ph-trash'))
                        .on('click', () => {
                            Database.instance.removeNurse(nurse)
                            listItem.remove()
                        })
                )
                .prepend(
                    new UtilElement('img')
                        .prop('src', 
                            (nurse.avatar.getChild(el => el.get('tag') === 'img')?.get('prop', 'src') as string) ?? ''))
                .parent(nurseList)
        })

        document.getElementById('add-nurse')!.onclick = () => window.location.hash = 'admin-addnurse'

        const showNurseListBtn = document.getElementById('show-nurse-list') as HTMLButtonElement
        showNurseListBtn.onclick = () => toggleState.bind(showNurseListBtn)(nurseList)        

        function toggleState(this: HTMLButtonElement, list: HTMLElement) {
            list.style.maxHeight = parseInt(list.style.maxHeight) > 0 ? '0px' : list.scrollHeight + 'px'
            this.classList.toggle('up')
        }
    }
}