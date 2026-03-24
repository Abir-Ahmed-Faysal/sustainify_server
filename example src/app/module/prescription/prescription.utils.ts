
import PDFDocument from 'pdfkit'
import { envVars } from '../../config/env';


export interface IPrescriptionPdf {
    doctorName: string;
    doctorEmail: string;
    patientName: string;
    patientEmail: string;
    followUpDate: Date;
    instructions: string;
    prescriptionId: string;
    appointmentDate: Date;
    createdAt: Date

}


export const generatePrescription = async (prescriptionData: IPrescriptionPdf): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (error) => reject(error));


            doc.fontSize(20).font("Helvetica-Bold").text('Prescription', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font("Helvetica").text(`Prescription ID: ${prescriptionData.prescriptionId}`);
            doc.moveDown(0.5);
            doc.text("Health Care Service LTD.", { align: "center" });
            doc.moveDown(1);
            doc.text('Welcome to Health Care Service LTD.', { align: "center" });
            doc.moveDown(0.5);
            doc.text(`Doctor Name: ${prescriptionData.doctorName}`);
            doc.moveDown(0.5);
            doc.text(`Patient Name: ${prescriptionData.patientName}`);
            doc.moveDown(0.5);
            if (prescriptionData.followUpDate) {
                doc.text(`Follow Up Date: ${new Date(prescriptionData.followUpDate).toDateString()}`);
            }
            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
            doc.text(`For more information, visit ${envVars.FRONTEND_URL}`);

            doc.end();
        } catch (error) {
            reject(error)
        }
    });
};