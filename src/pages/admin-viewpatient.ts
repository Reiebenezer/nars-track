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
        const nurseContainer = document.getElementById('nurses-with-access')

        if (!patient) return
        if (!container) return
        if (!nurseContainer) return

        Database.instance.nurses.forEach(nurse => {

            const label = new UtilElement('li')
                .append(
                    new UtilElement('label')
                        .html(nurse.data.name)
                        .append(
                            new UtilElement('input')
                                .prop('type', 'checkbox')
                                .toggleProp('checked', patient.data.nurses_with_access.includes(nurse.data.name))
                                .toggleProp('disabled', patient.data.admitting_nurse === nurse.data.name)
                                .on('change', () => {
                                    const nurses = patient.data.nurses_with_access
                                    const name = nurse.data.name
        
                                    if (nurses.includes(name))
                                        nurses.splice(nurses.indexOf(name))
        
                                    else
                                        nurses.push(name)
        
                                    console.log(nurses)
                                })
                        )
                )

            nurseContainer.append(label.element)
        })

        Object.entries(patient.data).forEach(([ key, value ]) => {
            if (key === "nurses_with_access") return

            const label = new UtilElement('label')
                .html(key.charAt(0).toUpperCase() + key.replace(/\_[A-Za-z0-9]/g, match => ' ' + match.charAt(1).toUpperCase()).slice(1))
                .append(
                    new UtilElement('input')
                        .prop('disabled')
                        .prop('value', value)
                )

            container.append(label.element)
        })
    }
}