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
            const data = {
                admitting_nurse: '',
                ...entries,
                datetime_discharged: null,
                hospital_days: null,
                final_diagnosis: null,
                nurses_with_access: new Array<string>()
            }
            data.nurses_with_access.push(data.admitting_nurse)

            Database.instance.addPatient(new Patient(data as unknown as PatientData))
            window.location.hash = 'admin-home'
        }

        const nursedatalist = form.querySelector('#admitting-nurses')! as HTMLDataListElement

        for (const nurse of Database.instance.nurses) {
            new UtilElement('option')
                .prop('value', nurse.data.name)
                .parent(nursedatalist)
        }
    }
}