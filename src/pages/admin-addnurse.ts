import Nurse from "../components/nurse"
import Database from "../managers/database"

export default class AdminAddNursePage {
    static #instance: AdminAddNursePage

	constructor() {
        if (AdminAddNursePage.#instance) return
	}

    static get instance() {
        if (!this.#instance) 
            this.#instance = new AdminAddNursePage()

        return this.#instance
    }

    init() {
        const form = document.getElementById('admin-addnurse')! as HTMLFormElement
        const imgInput = (form.querySelector('#profile') as HTMLInputElement)

        imgInput.onchange = () => {
            if (!imgInput.files || !imgInput.files[0]) return

            document.querySelector('label.preview')?.classList.add('show')
            readFile(imgInput.files[0])
                .then(profile => {
                    (document.getElementById('preview') as HTMLImageElement).src = profile
                })
                .catch(error => alert(error))
        }

        form.onsubmit = e => {
            e.preventDefault()

            const name = (form.querySelector('#name') as HTMLInputElement).value
            const title = (form.querySelector('#title') as HTMLInputElement).value as 'Nurse' | 'Lead Nurse'
            const pwd1 = (form.querySelector('#password-1') as HTMLInputElement).value
            const pwd2 = (form.querySelector('#password-2') as HTMLInputElement).value

            if (pwd1 !== pwd2) {
                throwError('The passwords don\'t match!')
                return
            }

            if (!imgInput.files || !imgInput.files[0]) return

            readFile(imgInput.files[0])
                .then(profile => {
                    console.log({
                        name, title, pwd1, profile
                    })  

                    Database.instance.addNurse(new Nurse({
                        name,
                        title,
                        password: pwd1,
                        profile,
                    }))
                
                    window.location.hash = 'admin-home'
                })

                .catch(error => throwError(error)) 


            }

            function throwError(message: string) {
                alert(message)
            }

            function readFile(fileData: File): Promise<string> {
                const fr = new FileReader()
    
                return new Promise((resolve, reject) => {
                    if (!matchExtensions(fileData, '.png', '.jpg', '.jpeg', '.gif')) {
                        reject('File type is invalid!')
                    }
    
                    if (fileData.size > 5242880) {
                        reject('File size cannot exceed 5 MB!')
                    }
    
                    fr.onload = e => resolve(e.target?.result as string)
                    fr.readAsDataURL(fileData)
                })
            }
    
            function matchExtensions(file: File, ...extensions: string[]) {
                for (const ext of extensions) {
                    if (file.name.endsWith(ext)) return true
                }
    
                return false
            }
        }
        
}