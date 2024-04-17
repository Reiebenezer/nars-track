import UtilElement from './util/element'

export default class Nurse {
	avatar: UtilElement
	data: NurseData

	_id: string = crypto.randomUUID()

	constructor(data: NurseData) {
		this.data = data
		this.avatar = new UtilElement('a')

		this.avatar
			.prop('href', `#nurse-login?name=${data.name}`)
			.append(
				new UtilElement('img').prop(
					'src',
						typeof data.profile === 'number'
							? `/src/assets/profiles/profile${data.profile % 9}.jpg`
							: data.profile
				),
				new UtilElement('h4').html(`${data.name}`),
				new UtilElement('p').html(data.title)
			)
			.class('nurse-avatar')
	}

	setID(id: string) {
		this._id = id
		return this
	}
}

export interface NurseData {
	name: string
	profile: number | string
	password: string
	title: 'Nurse' | 'Lead Nurse'
}