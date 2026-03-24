import { StatusCodes } from "http-status-codes"
import { PaymentStatus, Role } from "../../../generated/prisma/enums"
import AppError from "../../errorHelpers/AppError"
import { IUserRequest } from "../../interfaces/IUserRequest"
import { prisma } from "../../lib/prisma"
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface"

const giveReview = async (user: IUserRequest, payload: ICreateReviewPayload) => {

    const patient = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email }
    })

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: { id: payload.appointmentId },
        include: {
            doctor: {
                select: { id: true }
            }
        }
    })

    if (appointmentData.status !== PaymentStatus.PAID) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Payment not completed")
    }

    if (appointmentData.patientId !== patient.id) {
        throw new AppError(StatusCodes.FORBIDDEN, "Not authorized")
    }

    const isReviewed = await prisma.review.findFirst({
        where: {
            appointmentId: payload.appointmentId,
            patientId: patient.id
        }
    })

    if (isReviewed) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Already reviewed")
    }

    const result = await prisma.$transaction(async (tx) => {

        const review = await tx.review.create({
            data: {
                patientId: patient.id,
                appointmentId: appointmentData.id,
                rating: payload.rating,
                comment: payload.comment,
                doctorId: appointmentData.doctor.id
            }
        })

        const avgRating = await tx.review.aggregate({
            where: {
                doctorId: appointmentData.doctor.id
            },
            _avg: {
                rating: true
            }
        })

        await tx.doctor.update({
            where: {
                id: appointmentData.doctor.id
            },
            data: {
                averageRating: avgRating._avg.rating ?? 0
            }
        })

        return review
    })

    return result
}


const myReview = async (user: IUserRequest) => {

    if (user.role === Role.PATIENT) {
        return prisma.review.findMany({
            where: {
                patientId: user.id
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                        averageRating: true
                    }
                }
            }
        })
    }

    if (user.role === Role.DOCTOR) {
        return prisma.review.findMany({
            where: {
                doctorId: user.id
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                }
            }
        })
    }

    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid role")
}



const updateReview = async (
    user: IUserRequest,
    reviewId: string,
    payload: IUpdateReviewPayload
) => {

    const patient = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email }
    })

    const reviewData = await prisma.review.findUniqueOrThrow({
        where: { id: reviewId },
        include: {
            doctor: {
                select: { id: true }
            }
        }
    })

    if (reviewData.patientId !== patient.id) {
        throw new AppError(StatusCodes.FORBIDDEN, "Not authorized")
    }

    const result = await prisma.$transaction(async (tx) => {

        const review = await tx.review.update({
            where: {
                id: reviewId
            },
            data: {
                rating: payload.rating,
                comment: payload.comment
            }
        })

        // recalculating doctor average rating
        const avgRating = await tx.review.aggregate({
            where: {
                doctorId: reviewData.doctor.id
            },
            _avg: {
                rating: true
            }
        })

        await tx.doctor.update({
            where: {
                id: reviewData.doctor.id
            },
            data: {
                averageRating: avgRating._avg.rating ?? 0
            }
        })

        return review
    })

    return result
}


const deleteReview = async (user: IUserRequest, reviewId: string) => {

    const patient = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email }
    })

    const reviewData = await prisma.review.findUniqueOrThrow({
        where: { id: reviewId },
        select: {
            doctorId: true,
            patientId: true
        }
    })


    if (reviewData.patientId !== patient.id) {
        throw new Error("You are not authorized to delete this review")
    }

    const result = await prisma.$transaction(async (tx) => {

        const deletedReview = await tx.review.delete({
            where: { id: reviewId }
        })

        const avgRating = await tx.review.aggregate({
            where: {
                doctorId: reviewData.doctorId
            },
            _avg: {
                rating: true
            }
        })

        await tx.doctor.update({
            where: { id: reviewData.doctorId },
            data: {
                averageRating: avgRating._avg.rating ?? 0
            }
        })

        return deletedReview
    })

    return result
}

export const ReviewService = {
    giveReview,
    myReview,
    updateReview,
    deleteReview

}