export default class Patient {
    
    data: PatientData
    vitalsigns = new Array<PatientVitalSigns>()
    fdar = new Array<PatientFdar>()

    _id: string = crypto.randomUUID()

    constructor(data: PatientData) {
        this.data = data
    }

    setvitalsigns(arr: PatientVitalSigns[]) {
        this.vitalsigns = arr
        return this
    }

    setFdar(arr: PatientFdar[]) {
        this.fdar = arr
        return this
    }

    setID(id: string) {
        this._id = id
        return this
    }
}

export interface PatientData {
	name: string
	birthdate: Date | null
	birthplace: string | null
	address: string | null
	sex: 'F' | 'M' 
	civil_status: 'Single' | 'Married' | 'Widowed'
	religion: string | null
	nationality: string | null
	contact_number: number | null
	food_allergies: string | null
	medicine_allergies: string | null
	blood_type: string | null
	height: number | null
	weight: number | null
	kin_name: string | null
	kin_relationship: string | null
	kin_address: string | null
	kin_contact_number: number | null
	datetime_admitted: Date | null
	datetime_discharged: Date | null
	hospital_days: number | null
	attending_physician: string | null
	admitting_nurse: string | null
	admitting_diagnosis: string | null
	final_diagnosis: string | null
	nurses_with_access: string[]
}

export interface PatientVitalSigns {
	timestamp: Date
	nurse: string
	temperature: number | null
	pulse: number | null
	respiration: number | null
	blood_pressure: string | null
	oxygen: number | null
}

export interface PatientFdar {
	focus: string | null
	data: string | null
	action: string | null
	response: string | null
}