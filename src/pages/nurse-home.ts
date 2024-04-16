import Nurse from "../components/nurse"
import { PatientVitalSigns } from "../components/patient"
import UtilElement from "../components/util/element"
import hash from "../components/util/url-hash"
import Database from "../managers/database"
import Scanner from "../managers/websocket"

export default class NurseHomePage {
	static #instance: NurseHomePage

	constructor() {
		if (NurseHomePage.#instance) return
	}

	static get instance() {
		if (!this.#instance) this.#instance = new NurseHomePage()

		return this.#instance
	}

	async init() {
		const indicator_text = document.querySelector('p.await-input')!
		const open_catalog = document.getElementById('open-catalog')!
		const list = document.querySelector('#assigned-patients ul')!
		const form = document.getElementById('patient-data')! as HTMLFormElement

		open_catalog.onclick = () => {
			if (list.hasChildNodes()) {
				list.innerHTML = ''

			} else {
				this.#getAssignedPatients()
			}
		}

		if (Scanner.instance.connected) {
			const patientID = await Scanner.instance.waitMessage()
			
			try {
				// Fetch the data from patient list and match with parsed_data
				const patient = Database.instance.getPatient(patientID)

				if (!patient) {
					indicator_text.innerHTML = 'Patient not found in database'
					this.init()
					return
				}

				const essential_data = {
					id: patient._id,
					name: patient.data.name,
				}
				
				const vitalsign: PatientVitalSigns = {
					blood_pressure: null,
					oxygen: null,
					pulse: null,
					respiration: null,
					temperature: null,
					timestamp: new Date()
				}

				addEntries(essential_data)
				addEntries(vitalsign)
				
				form.appendChild(new UtilElement('button').html('Send Data').element)
				form.onsubmit = e => {
					e.preventDefault() 
					const data = {...Object.fromEntries(new FormData(form).entries()), timestamp: new Date()} as PatientVitalSigns
					patient.vitalsigns.push(data)

					console.log(patient.vitalsigns)
				}

				indicator_text.innerHTML = 'Fetch Results:'

				

				function addEntries(entries: object) {
					Object.entries(entries).forEach(entry => {
						const el = new UtilElement('input')
							.prop('name', entry[0])
							.prop('value', processEntry(entry[1]))
						
						if (entry[1] !== null) el.prop('disabled', '')

						const parent = new UtilElement('label')
							.html(
								entry[0].charAt(0).toUpperCase() +
									entry[0].slice(1).replace(/_/g, ' ')
							)
							.append(el)

						form.appendChild(parent.element)
					})

					function processEntry(entry: any): string {
						const assumed_date = (new Date(entry))
						if (assumed_date.getTime() > 0) return assumed_date.toString()
	
						if (entry === null) return ''
						if (entry instanceof Nurse) return entry.data.name
						if (typeof entry === 'object') return JSON.stringify(entry)
	
						return entry
					}
				}

			} catch (error) {
				console.error(error)
			}
		} else {
			indicator_text.innerHTML = 'Scanner not available.'
		}
	}

	#getAssignedPatients() {
		const name = hash().params.find(item => item[0] === 'name')![1]
		const patients = Database.instance.getPatients(name)

		document
			.querySelector('#assigned-patients ul')
			?.append(
				...patients.map(p =>
					new UtilElement('li').html(
						`<strong>Name: </strong>${p.data.name}`
					).element
				)
			)
	}
}
