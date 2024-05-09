import { Store } from '@tauri-apps/plugin-store'
import Nurse, { NurseData } from '../components/nurse'
import Patient, { PatientData, PatientFdar, PatientVitalSigns } from '../components/patient'

export default class Database {
	static #instance?: Database

	nurses = new Array<Nurse>()
	patients = new Array<Patient>()

	store?: Store

	constructor() {
		if (Database.#instance) return
	}

	static get instance() {
		if (!this.#instance) this.#instance = new Database()

		return this.#instance
	}

    async init() {
		this.store = await new Store('db.bin')

		const patientDatas = JSON.parse(await this.store.get('patients') ?? '[]') as { _id: string, data: PatientData, vitalsigns: PatientVitalSigns[], fdar: PatientFdar[] }[]
		const  nursesDatas = JSON.parse(await this.store.get('nurses') ?? '[]') as { _id: string, data: NurseData }[]

		this.patients = patientDatas.map(p => new Patient(p.data).setvitalsigns(p.vitalsigns).setFdar(p.fdar).setID(p._id))
		this.nurses   =  nursesDatas.map(n => new Nurse(n.data).setID(n._id))
		
    }

	getPatient(id: string) {
		return this.patients.find(p => p._id === id)
	}

	getPatients(nurseID: string) {
		return this.patients.filter(p => p.data.datetime_discharged === null && p.data.nurses_with_access.includes(nurseID))
	}
	
	addPatient(patient: Patient) {
		this.patients.push(patient)
		this.save()
	}

	removePatient(patient: Patient) {
		this.patients.splice(this.patients.indexOf(patient))
		this.save()
	}

	addNurse(nurse: Nurse) {
		this.nurses.push(nurse)
		this.save()
	}

	removeNurse(nurse: Nurse) {
		this.nurses.splice(this.nurses.indexOf(nurse), 1)
		this.save()
	}

	populate() {
		const nurse_names = [
			'Elena Garcia',
			'Kai Tanaka',
			'Sarah Jones',
			'Omar Hassan',
			'Chloe Dubois',
			'Marco Rossi',
			'Evelyn Kim',
			'Benjamin Nguyen',
		]

		const patient_names = [
			'Natalia Petrova',
			'Diego Lopez',
			'Aaliyah Johnson',
			'Liam Murphy',
			'Hanako Sato',
			'William Schmidt',
			'Noor Patel',
			'Isabelle LeBlanc',
			'Michael Cohen',
			'Aisha Mohammed',
			'Maya Rodriguez',
			'Ethan Lee',
			'Evelyn Brooks',
			'Chen Wei',
			'Daniel Fernandez',
			'Olivia Clarke',
			'Lucas Baker',
			'Sophia Patel',
			'Ethan Williams',
			'Amelia Young',
			'Benjamin Wilson',
			'Charlotte Moore',
			'Noah Taylor',
			'Ava Brown',
			'Elijah Robinson',
			'Emily Garcia',
			'Matthew Hernandez',
			'Harper Walker',
			'Alexander Thompson',
			'Isabella Lewis',
			'James Allen',
			'Mia Johnson',
			'Logan King',
			'Evelyn Jones',
			'David Miller',
			'Chloe Garcia',
			'Michael Davis',
			'Sofia Lopez',
			'William Moore',
			'Evelyn Thomas',
			'Christopher Hernandez',
			'Abigail Young',
			'Andrew Martinez',
			'Elizabeth Gonzalez',
			'Joseph Garcia',
			'Olivia Walker',
			'Daniel Clark',
			'Madison Allen',
			'Joshua Moore',
			'Evelyn Anderson',
		]

		nurse_names.forEach((name, i) => this.nurses.push(new Nurse({ name, title: 'Nurse', password: '', profile: i })))
		patient_names.forEach((name, i) => this.patients.push(new Patient({ name, 
			address: null,
			admitting_diagnosis: null,
			admitting_nurse: this.nurses[i%this.nurses.length].data.name,
			food_allergies: null,
			medicine_allergies: null,
			attending_physician: null,
			birthdate: null,
			birthplace: null,
			blood_type: null,
			civil_status: 'Single',
			contact_number: null,
			datetime_admitted: new Date(),
			datetime_discharged: null,
			final_diagnosis: null,
			height: null,
			hospital_days: null,
			kin_address: null,
			kin_contact_number: null,
			kin_name: null,
			kin_relationship: null,
			nationality: null,
			religion: null,
			sex: 'F',
			weight: null,
			nurses_with_access: [this.nurses[i%this.nurses.length].data.name]
		 })))

		this.save()
	}

	save() {
		const nurse_str = JSON.stringify(
			this.nurses.map(nurse => ({ _id: nurse._id, data: nurse.data }))
		)

		const patient_str = JSON.stringify(
			this.patients.map(patient => ({ _id: patient._id, data: patient.data, vitalsigns: patient.vitalsigns, fdar: patient.fdar }))
		)

		if (!this.store) 
			throw new ReferenceError('You did not call init!')

		this.store.set('nurses', nurse_str)
		this.store.set('patients', patient_str)

		this.store.save()
	}

	async clear() {
		if (!this.store)
			throw new ReferenceError('You did not call init!')

		await this.store.clear()
		await this.store.save()

		this.nurses.length = 0
		this.patients.length = 0
	}

	async CLIclearAndPopulate() {
		if (!this.store) this.store = await new Store('db.bin')

		await this.clear()
		this.populate()
	}

	async removeDischarged() {
		if (!this.store)
			throw new ReferenceError('You did not call init!')

		this.patients = this.patients.filter(p => p.data.datetime_discharged === null)
		this.save()
	}
}

declare global {
	interface Window {
		db: Database
		Store: typeof Store
	}
}

window.db = Database.instance
window.Store = Store