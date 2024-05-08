import UtilElement from '../components/util/element'
import hash from '../components/util/url-hash'
import Database from '../managers/database'

export default class AdminViewMeasuredDataPage {
    static #instance: AdminViewMeasuredDataPage

    constructor() {
        if (AdminViewMeasuredDataPage.#instance) return
    }

    static get instance() {
        if (!this.#instance) this.#instance = new AdminViewMeasuredDataPage()

        return this.#instance
    }

    init() {
        const idParam = hash().params.find(p => p[0] === 'id')
        if (!idParam) return

        const patient = Database.instance.getPatient(idParam[1])
        if (!patient) return

        document.getElementById(
            'param-name'
        )!.innerHTML = `Patient ${patient.data.name}'s Vital Signs Record`
        const measuredDataContainer = document.getElementById('measured-data')!

        for (const vs of patient.vitalsigns) {
            const container = new UtilElement('div')
                .class('vitalsign-record')
                .append(
                    new UtilElement('div').class('data').append(
                        new UtilElement('p').html(vs.timestamp.toLocaleString()),
                        new UtilElement('button')
                            .class('icon')
                            .html('<span class="ph-bold ph-caret-down"></span>')
                            .on('click', () => {
                                container.element.classList.toggle('active')
                            })
                    )
                )

            const innerContainer = new UtilElement('ul').class('vitalsign-data')

            Object.entries(vs).forEach(([key, value]) => {
                if (key === 'timestamp') return

                const label = new UtilElement('label')
                    .html(
                        key.charAt(0).toUpperCase() +
                            key
                                .replace(
                                    /\_[A-Za-z0-9]/g,
                                    match => ' ' + match.charAt(1).toUpperCase()
                                )
                                .slice(1)
                    )
                    .append(
                        new UtilElement('input')
                            .prop('disabled')
                            .prop('value', value)
                    )

                innerContainer.append(label.element)
            })

            container.append(innerContainer)
            measuredDataContainer.appendChild(container.element)

            ;(innerContainer.element as HTMLElement).style.setProperty(
                '--max-height', 
                innerContainer.element.scrollHeight + 'px'
            ) 
        }
    }
}
