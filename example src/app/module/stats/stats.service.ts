import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { AppointmentStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user: IUserRequest) => {

    let statsData;

    switch (user.role) {
        case Role.SUPER_ADMIN:
            statsData = await getSuperAdminStatsData();
            break;

        case Role.ADMIN:
            statsData = await getAdminStatsData();
            break;

        case Role.DOCTOR:
            statsData = await getDoctorStatsData(user);
            break;

        case Role.PATIENT:
            statsData = await getPatientStatsData(user);
            break;

        default:
            throw new AppError(
                StatusCodes.FORBIDDEN,
                "You are not authorized to access this route"
            );
    }

    return statsData;
};

const getSuperAdminStatsData = async () => {

    const [
        appointmentCount,
        doctorCount,
        patientCount,
        adminCount,
        paymentCount,
        userCount,
        revenue
    ] = await Promise.all([
        prisma.appointment.count(),
        prisma.doctor.count(),
        prisma.patient.count(),
        prisma.admin.count(),
        prisma.payment.count(),
        prisma.user.count(),
        prisma.payment.aggregate({
            where: {
                status: PaymentStatus.PAID
            },
            _sum: { amount: true }
        })
    ]);

    const pieChartData = await getPieChartData()
    const barChartData = await getBarChartData()


    return {
        appointmentCount,
        doctorCount,
        patientCount,
        userCount,
        adminCount,
        paymentCount,
        totalRevenue: revenue._sum.amount || 0, pieChartData,
         barChartData
    };
};

const getAdminStatsData = async () => {

    const [
        appointmentCount,
        doctorCount,
        patientCount,
        superAdminCount,
        adminCount,
        paymentCount,
        userCount,
        revenue
    ] = await Promise.all([
        prisma.appointment.count(),
        prisma.doctor.count(),
        prisma.patient.count(),
        prisma.super_Admin.count(),
        prisma.admin.count(),
        prisma.payment.count(),
        prisma.user.count(),
        prisma.payment.aggregate({
            where: {
                status: PaymentStatus.PAID
            },
            _sum: { amount: true }
        })
    ]);

    const pieChartData = await getPieChartData()
    const barChartData = await getBarChartData()

    return {
        appointmentCount,
        doctorCount,
        superAdminCount,
        patientCount,
        userCount,
        adminCount,
        paymentCount,
        totalRevenue: revenue._sum.amount || 0,
        pieChartData,
        barChartData
    };
};

const getDoctorStatsData = async (user: IUserRequest) => {

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: { email: user.email }
    });

    const [
        reviewCount,
        appointmentCount,
        patientGroup,
        revenue,
        appointmentStatusDistribution
    ] = await Promise.all([
        prisma.review.count({
            where: { doctorId: doctorData.id }
        }),
        prisma.appointment.count({
            where: {
                doctorId: doctorData.id,
                appointmentStatus: AppointmentStatus.COMPLETE
            }
        }),
        prisma.appointment.groupBy({
            where: {
                doctorId: doctorData.id,
                appointmentStatus: AppointmentStatus.COMPLETE
            },
            by: ["patientId"],
            _count: { id: true }
        }),
        prisma.payment.aggregate({
            where: {
                appointment: { doctorId: doctorData.id },
                status: PaymentStatus.PAID
            },
            _sum: { amount: true }
        }),
        prisma.appointment.groupBy({
            where: { doctorId: doctorData.id },
            by: ["appointmentStatus"],
            _count: { id: true }
        })
    ]);

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(
        ({ appointmentStatus, _count }) => ({
            appointmentStatus,
            count: _count.id
        })
    );

    return {
        reviewCount,
        appointmentCount,
        patientCount: patientGroup.length,
        totalRevenue: revenue._sum.amount || 0,
        appointmentStatusDistribution: formattedAppointmentStatusDistribution
    };
};

const getPatientStatsData = async (user: IUserRequest) => {

    const patientData = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email }
    });

    const [
        appointmentCount,
        reviewCount,
        appointmentStatusDistribution
    ] = await Promise.all([
        prisma.appointment.count({
            where: { patientId: patientData.id }
        }),
        prisma.review.count({
            where: { patientId: patientData.id }
        }),
        prisma.appointment.groupBy({
            where: { patientId: patientData.id },
            by: ["appointmentStatus"],
            _count: { id: true }
        })
    ]);

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(
        ({ appointmentStatus, _count }) => ({
            appointmentStatus,
            count: _count.id
        })
    );

    return {
        appointmentCount,
        reviewCount,
        appointmentStatusDistribution: formattedAppointmentStatusDistribution
    };
};


const getPieChartData = async () => {
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["appointmentStatus"],
        _count: {
            id: true
        }
    })

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ appointmentStatus, _count }) => ({
        appointmentStatus,
        count: _count.id
    }))

    return { appointmentStatusDistribution: formattedAppointmentStatusDistribution }

}

const getBarChartData = async () => {

    interface AppointmentCountByMonth {
        month: Date;
        count: number;
    }

    const appointmentCountByMonth = await prisma.$queryRaw<AppointmentCountByMonth[]>`
    SELECT
      DATE_TRUNC('month',"createdAt") AS month,
      CAST(COUNT(*) AS INTEGER) AS count
    FROM "appointments"
    GROUP BY month
    ORDER BY month ASC
  `;

    return appointmentCountByMonth;
};


export const statsService = {
    getDashboardStatsData
};