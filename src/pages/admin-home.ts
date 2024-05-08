import Swal from "sweetalert2"
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
                            Swal.fire({
                                icon: 'warning',
                                title: 'Delete Nurse',
                                html: 'Are you sure you want to remove this nurse<br>from the database?',
                                showCancelButton: true,
                                cancelButtonText: 'No, cancel',
                                confirmButtonText: 'Yes, remove'
                            }).then(res => {
                                if (res.isConfirmed) {
                                    Database.instance.removeNurse(nurse)
                                    listItem.remove()
                                }
                            })
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
        
        ;(document.getElementById('remove-empty')!.onclick = () => {
            Swal.fire({
                icon: 'warning',
                title: 'Remove Discharged Patients',
                html: 'Remove the discharged patients from database?<br>This cannot be undone!',
                showCancelButton: true,
            }).then(async res => {
                if (res.isConfirmed)
                    await Database.instance.removeDischarged()
            })
        })

        ;(document.getElementById('clear-all')!.onclick = async () => {
            let res = await Swal.fire({
                icon: 'warning',
                title: 'Reset Application',
                html: 'Reset the application to its factory state?<br>This cannot be undone!',
                showCancelButton: true,
            })

            if (!res.isConfirmed) return
            
            res = await Swal.fire({
                icon: 'warning',
                title: 'Reset Application Confirmation',
                html: 'The entire application will be reset,<br>removing all nurses and patients from the database.',
                input: 'checkbox',
                inputPlaceholder: 'I have read and understand these effects',
                inputValidator: result => !result && 'You need to check this box to continue!'
            })

            if (!res.isConfirmed) return

            res = await Swal.fire({
                html: 'Input the admin password to continue.',
                input: 'password',
                inputValidator: val => val !== 'NarsTrack2024' && 'Incorrect password'
            })

            if (!res.isConfirmed) return
            await Database.instance.clear()
        })

        function toggleState(this: HTMLButtonElement, list: HTMLElement) {
            list.style.maxHeight = parseInt(list.style.maxHeight) > 0 ? '0px' : list.scrollHeight + 'px'
            this.classList.toggle('up')
        }
    }
}