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

        form.onsubmit = e => {
            e.preventDefault()

            const entries = Object.fromEntries(new FormData(form).entries()) as object
            const data = {
                ...entries,
                datetime_discharged: null,
                hospital_days: null,
                final_diagnosis: null
            }

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