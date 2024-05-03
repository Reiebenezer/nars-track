import UtilElement from "../components/util/element"
import hash from "../components/util/url-hash"
import Database from "../managers/database"

export default class AdminViewPatientPage {
    static #instance: AdminViewPatientPage

	constructor() {
        if (AdminViewPatientPage.#instance) return
	}

    static get instance() {
        if (!this.#instance) 
            this.#instance = new AdminViewPatientPage()

        return this.#instance
    }

    init() {
        const patient = Database.instance.getPatient(hash().params.find(p => p[0] === 'id')![1])
        const container = document.getElementById('patient-data')

        if (!patient) return
        if (!container) return
        Object.entries(patient.data).forEach(([ key, value ]) => {
            const label = new UtilElement('label')
                .html(key)
                .append(
                    new UtilElement('input')
                        .prop('disabled')
                        .prop('placeholder', value)
                )

            container?.append(label.element)
        })
    }
}