import Swal from 'sweetalert2'
import Nurse from '../components/nurse'
import { PatientFdar, PatientVitalSigns } from '../components/patient'
import UtilElement from '../components/util/element'
import hash from '../components/util/url-hash'
import Database from '../managers/database'
import Scanner from '../managers/websocket'

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
			await this.#scan()

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
                ...patients.map(
                    p =>
                        new UtilElement('li').html(
                            `<p><strong>Name: </strong>${p.data.name}</p>`
                        ).element
                )
            )
    }

    async #scan(): Promise<void> {
        const form = document.getElementById('patient-data')! as HTMLFormElement

        let patientIDFunc = Scanner.instance.waitMessage()
        // Scanner.instance.ws.send(Database.instance.patients[0]._id)

        let patientID = await patientIDFunc
        const indicator_text = document.querySelector('p.await-input')!

        const nurseName = hash().params.find(p => p[0] === 'name')

        if (!nurseName) {
            console.error('Nurse name not defined in params!')
            return
        }

        try {
            // Fetch the data from patient list and match with parsed_data
            let patient = Database.instance.getPatient(patientID)

			if (patient === undefined) {
				indicator_text.innerHTML = 'Patient not found in database'
				return await this.#scan()
			}
			
			else if (!patient.data.nurses_with_access.includes(nurseName[1])) {
				await Swal.fire({
					icon: 'error',
					titleText: 'Incorrect Patient Assignment',
					text: 'You are not assigned to this patient!',
					timer: 5000,
				})

				return await this.#scan()
			}

            const essential_data = {
                id: patient._id,
                name: patient.data.name,
            }

            const vitalsign: PatientVitalSigns = {
                timestamp: new Date(),
                nurse: nurseName[1],
                blood_pressure: null,
                oxygen: null,
                pulse: null,
                respiration: null,
                temperature: null,
            }

            const fdar: PatientFdar = {
                action: null,
                data: null,
                focus: null,
                response: null
            }

            addEntries(essential_data)
            addEntries(vitalsign)
            addFDAR()

            form.appendChild(
                new UtilElement('button').html('Send Data').element
            )
            form.onsubmit = async e => {
                e.preventDefault()
                const data = {
                    ...Object.fromEntries(new FormData(form).entries()),
                    timestamp: new Date(),
                } as PatientVitalSigns & PatientFdar

                patient.vitalsigns.push({
                    blood_pressure: data.blood_pressure,
                    nurse: nurseName[1],
                    oxygen: data.oxygen,
                    pulse: data.pulse,
                    respiration: data.respiration,
                    temperature: data.temperature,
                    timestamp: data.timestamp
                })

                patient.fdar.push({
                    action: data.action,
                    data: data.data,
                    focus: data.focus,
                    response: data.response
                })

                Database.instance.save()

                indicator_text.innerHTML = 'Data Saved. Waiting for next input...'
                form.innerHTML = ''

				await this.#scan()
            }

            indicator_text.innerHTML = 'Patient Vital Signs and FDAR Form'

            function addEntries(entries: object, asTextarea = false) {
                Object.entries(entries).forEach(entry => {
                    if (entry[0] === 'timestamp') return

                    const nums = ['oxygen', 'pulse', 'respiration', 'temperature']
                    const el = new UtilElement(asTextarea ? 'textarea' : 'input')
                        .prop('type', nums.includes(entry[0]) ? 'number' : 'text')
                        .prop('name', entry[0])
                        .prop('value', processEntry(entry[1]))
                        .prop('required')

                    if (entry[1] !== null) el.prop('disabled', '')
                    if (entry[1] instanceof Date) el.prop('value', entry[1].toLocaleString())

                    const parent = new UtilElement('label')
                        .html(
                            entry[0].charAt(0).toUpperCase() +
                                entry[0].slice(1).replace(/_/g, ' ')
                        )
                        .append(el)

                    form.appendChild(parent.element)
                })

                function processEntry(entry: any): string {
                    const assumed_date = new Date(entry)
                    if (assumed_date.getTime() > 0)
                        return assumed_date.toString()

                    if (entry === null) return ''
                    if (entry instanceof Nurse) return entry.data.name
                    if (typeof entry === 'object') return JSON.stringify(entry)

                    return entry
                }
            }

            function addFDAR() {
                const timestamp = new Date()
                const container = new UtilElement('div').class('fdar')
                const notes = new  UtilElement('div').class('progress-notes').html('Progress Notes')

                container.append(
					new UtilElement('label')
						.html('Date/Hour')
						.append(
							new UtilElement('input')
								.prop('name', 'timestamp')
								.prop('value', timestamp.toLocaleString())
								.prop('disabled')
						),

					new UtilElement('label')
						.html('Focus')
						.append(
							new UtilElement('textarea')
                                .prop('required')
								.prop('rows', '1')
								.prop('name', 'focus')
						)
				)

                Object.entries(fdar).forEach(([ label, _ ]) => {
                    if (label === 'focus') return

					const labelEl = new UtilElement('label')
						.html(
							label.charAt(0).toUpperCase() +
								label.slice(1).replace(/_/g, ' ')
                        )
						.append(
							new UtilElement('textarea')
								.prop('name', label)
								.prop('required')
								.prop('rows', '1')
						)

					notes.append(labelEl)
                })

                container.append(notes)
                form.appendChild(container.element)
            }   
        } catch (error) {
            console.error(error)
        }
    }
}
