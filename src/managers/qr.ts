import QRCode from "qrcode"
import Patient from "../components/patient"

export default function generatePatientQR(patient: Patient, onfinish: (url: string) => void) {
    QRCode.toDataURL(
        patient.data.name,
        {
            type: "image/png",
            color: { dark: "#1169B4", light: "#fff" },
        },

        (err, url) => {
            if (err) return console.log(err)
            onfinish(url)
        }
    )
}