import Swal from "sweetalert2"
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
		
		this.#getAssignedPatients()

		const parent = list.parentElement!
		parent.style.setProperty('--max-height', parent.scrollHeight + 'px')
		open_catalog.onclick = () => {
			open_catalog.classList.toggle('secondary')
			open_catalog.innerHTML = 
				open_catalog.innerHTML === 'Open Catalog'
					? 'Close Catalog'
					: 'Open Catalog'
			parent.classList.toggle('open')
		}

		if (Scanner.instance.connected) {
			let patientID = await Scanner.instance.waitMessage()
			const nurseName = hash().params.find(p => p[0] === 'name')
			
			if (!nurseName) {
				console.error('Nurse name not defined in params!')
				return
			}

			try {
				// Fetch the data from patient list and match with parsed_data
				let patient = Database.instance.getPatient(patientID)

				while (!patient || patient.data.admitting_nurse !== nurseName[1]) {
					if (!patient) 
						indicator_text.innerHTML = 'Patient not found in database'

					else 
						Swal.fire({
							icon: 'error',
							titleText: 'Incorrect Patient Assignment',
							text: 'You are not assigned to this patient!',
							timer: 5000,
						})

					patientID = await Scanner.instance.waitMessage()
					patient = Database.instance.getPatient(patientID)

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
					Database.instance.save()

					indicator_text.innerHTML = 'Data Saved. Waiting for next input...'
					form.innerHTML = ''
				}

				indicator_text.innerHTML = 'Fetch Results:'

				

				function addEntries(entries: object) {
					Object.entries(entries).forEach(entry => {
						const el = new UtilElement('input')
							.prop('name', entry[0])
							.prop('value', processEntry(entry[1]))
							.prop('required')
						
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
		// const nurses = Database.instance.nurses.map(n => n.data.name)

		document
			.querySelector('#assigned-patients ul')
			?.append(
				...patients.map(p =>
					new UtilElement('li')
						.html(`<p><strong>Name: </strong>${p.data.name}</p>`)
						.element
				)
			)
	}
}
