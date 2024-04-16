import UtilElement from './util/element'

export default class Nurse {
	avatar: UtilElement
	data: NurseData
	profile_picture?: string

	_id: string = crypto.randomUUID()

	constructor(data: NurseData) {
		this.data = data
		this.avatar = new UtilElement('a')

		this.avatar
			.prop('href', `#nurse-login?name=${data.name}`)
			.append(
				new UtilElement('img').prop(
					'src',
					`/src/assets/profiles/profile${data.profile % 9}.jpg`
				),
				new UtilElement('h4').html(`${data.name}`),
				new UtilElement('p').html('Nurse 1')
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
	profile: number
	password: string
}