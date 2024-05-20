import Patient, { PatientData } from "../components/patient"
import UtilElement from "../components/util/element"
import Database from "../managers/database"

export default class AdminAddPatientPage {
    static #instance: AdminAddPatientPage

	constructor() {
        if (AdminAddPatientPage.#instance) return
	}

    static get instance() {
        if (!this.#instance) 
            this.#instance = new AdminAddPatientPage()

        return this.#instance
    }

    init() {
        const form = document.getElementById('admin-addpatient') as HTMLFormElement
        (document.getElementById('datetime-admitted') as HTMLInputElement).value = new Date().toLocaleString()

        form.onsubmit = (e: Event) => {
            e.preventDefault()

            const entries = Object.fromEntries(new FormData(form).entries()) as object

            const profile = form.querySelector('input[name="profile"]') as HTMLInputElement
            
            if (!profile.files || !profile.files[0]) return

            readFile(profile.files[0])
                .then(profile => {
                    
                    const data = {
                        admitting_nurse: '',
                        ...entries,
                        profile,
                        datetime_discharged: null,
                        hospital_days: null,
                        final_diagnosis: null,
                        nurses_with_access: new Array<string>()
                    } as PatientData
        
        
                    data.nurses_with_access.push(data.admitting_nurse!)
        
                    Database.instance.addPatient(new Patient(data as unknown as PatientData))
                    window.location.hash = 'admin-home'
                })

        }

        const nursedatalist = form.querySelector('#admitting-nurses')! as HTMLDataListElement

        for (const nurse of Database.instance.nurses) {
            new UtilElement('option')
                .prop('value', nurse.data.name)
                .parent(nursedatalist)
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