import { writeFile } from "@tauri-apps/plugin-fs"
import UtilElement from "../components/util/element"
import Database from "../managers/database"
import generatePatientQR from "../managers/qr"

import { save } from "@tauri-apps/plugin-dialog"
import { path } from "@tauri-apps/api"
import Swal from "sweetalert2"

export default class AdminPatientListPage {
	static #instance: AdminPatientListPage

	constructor() {
		if (AdminPatientListPage.#instance) return
	}

	static get instance() {
		if (!this.#instance) this.#instance = new AdminPatientListPage()

		return this.#instance
	}

	init() {
		const list = document.querySelector(
			"#admin-patientlist ul.list"
		)! as HTMLUListElement

		displayPatients()

		const searchInput = document.getElementById(
			"patient-search"
		) as HTMLInputElement
		const searchBtn = document.getElementById(
			"patient-search-btn"
		) as HTMLButtonElement

		searchInput.onkeyup = changeSearch
		searchBtn.onclick = changeSearch

		function changeSearch() {
			const text = searchInput.value
			displayPatients(text)
		}

		function displayPatients(filter?: string) {
			list.innerHTML = ""

			for (const patient of Database.instance.patients.filter(
				patient =>
					!filter ||
					patient.data.name.toLowerCase().includes(filter.toLowerCase())
			)) {
				new UtilElement("li")
					.html(
						`<div><strong>${patient.data.name}</strong><br><small>${
							patient.data.datetime_discharged !== null ? "Discharged" : "Admitted"
						}</small></div>`
					)
					.class(patient.data.datetime_discharged !== null ? 'discharged' :'')
					.append(
						new UtilElement("div")
						.append(
							new UtilElement("button")
								.class("icon")
								.prop("title", "Generate and download QR code")
								.toggleProp('disabled', patient.data.datetime_discharged !== null)
								.html('<span class="ph-bold ph-qr-code"></span>')
								.on("click", () => {
									// Generate QR Code
									generatePatientQR(patient, async url => {
										const filename = `NarsTrack-${patient.data.name}-2024.png`
										const filepath = await save({
											defaultPath:
												(await path.documentDir()) + "/" + filename,
											title: "Save QR Code",
											filters: [
												{
													name: "Image Files",
													extensions: ["png", "jpeg"],
												},
											],
										})
										if (!filepath) return

										writeFile(filepath, toUint8(url))

										function toUint8(url: string) {
											url = url.replace("data:image/png;base64,", "")
											const bytestr = atob(url)

											const bytes = new Uint8Array(bytestr.length)
											for (let i = 0; i < bytestr.length; i++) {
												bytes[i] = bytestr.charCodeAt(i)
											}

											return bytes
										}
									})
								}),

							new UtilElement("button")
								.class("icon", "secondary")
								.prop("title", "Discharge Patient")
								.toggleProp('disabled', patient.data.datetime_discharged !== null)
								.html('<span class="ph-bold ph-x"></span>')
								.on("click", () => {
									Swal.fire({
										titleText: 'Discharge Patient',
										text: 'Are you sure you want to mark this patient as discharged?',
										showCancelButton: true,
										cancelButtonText: 'Cancel',
										confirmButtonText: 'Yes, discharge',
										icon: 'warning'
									}).then(() => {
										patient.data.datetime_discharged = new Date()
										patient.data.hospital_days = Math.ceil(
											Math.abs(new Date().getTime() - patient.data.datetime_admitted!.getTime()) /
											(1000 * 60 * 60 * 24)
										)
									})
								})
						)
					)
					.parent(list)
			}
		}
	}
}
