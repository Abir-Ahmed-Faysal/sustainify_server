import { addHours, addMinutes, format } from "date-fns"
import { prisma } from "../../lib/prisma"
import { ICreateSchedulePayload } from "./schedule.interface"
import { convertDateTime } from "./shedule.utils"
import { IQueryParams } from "../../interfaces/query.interface"
import { QueryBuilder } from "../../utilities/QueryBuilder"
import { Prisma, Schedule } from "../../../generated/prisma/client"
import { scheduleFilterableFields, scheduleIncludeConfig, scheduleSearchableFields } from "./schedule.constant"
import { IUpdateSchedulePayload } from "./schedule.validation"
import AppError from "../../errorHelpers/AppError"
import { StatusCodes } from "http-status-codes"


const createSchedule = async (payload: ICreateSchedulePayload) => {

    const { startDate, endDate, startTime, endTime } = payload

    const interval = 30 // 30 minutes interval

    const currentDate = new Date(startDate);
    const finishDate = new Date(endDate)

    const schedule = []

    while (currentDate <= finishDate) {

        const startDateTime = new Date(
            addMinutes(
                addHours(
                    new Date(format(currentDate, "yyyy-MM-dd")),
                    Number(startTime.split(':')[0])
                ),
                Number(startTime.split(':')[1])
            )
        )

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    new Date(format(currentDate, "yyyy-MM-dd")),
                    Number(endTime.split(':')[0])
                ),
                Number(endTime.split(':')[1])
            )
        )

        while (startDateTime < endDateTime) {

            const s = await convertDateTime(startDateTime)
            const e = await convertDateTime(addMinutes(startDateTime, interval))

            const scheduleData = {
                startDateTime: s,
                endDateTime: e
            }

            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime
                }
            })

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: {
                        startDateTime: scheduleData.startDateTime,
                        endDateTime: scheduleData.endDateTime
                    }
                })
                schedule.push(result)
            }

            startDateTime.setMinutes(startDateTime.getMinutes() + interval)
        }

        currentDate.setDate(currentDate.getDate() + 1)
    }

    return schedule
}





const getAllSchedule = async (query: IQueryParams) => {

    const queryBuilder = new QueryBuilder<Schedule, Prisma.ScheduleWhereInput, Prisma.ScheduleInclude>(prisma.schedule, query, {
        searchableFields: scheduleSearchableFields,
        filterableFields: scheduleFilterableFields,
    })

    const result = await queryBuilder
        .search()
        .filter()
        .paginate()
        .dynamicInclude(scheduleIncludeConfig)
        .sort()
        .fields()
        .execute()

    return result
}

const getScheduleById = async (id: string) => {
    const result = await prisma.schedule.findUnique({
        where: {
            id
        }
    })
    return result
}

// refactoring needed cause to check there any schedule for this time exist ..if exist the doctor appointment will be destroyed
const updateSchedule = async (
    id: string,
    payload: IUpdateSchedulePayload
) => {
    const { startDate, startTime, endDate, endTime } = payload;

    // Convert startDate + startTime into a single Date object
    const startDateTime = addMinutes(
        addHours(new Date(format(new Date(startDate), "yyyy-MM-dd")), Number(startTime.split(":")[0])),
        Number(startTime.split(":")[1])
    );

    // Convert endDate + endTime into a single Date object
    const endDateTime = addMinutes(
        addHours(new Date(format(new Date(endDate), "yyyy-MM-dd")), Number(endTime.split(":")[0])),
        Number(endTime.split(":")[1])
    );

    // First, try to find the schedule
    const schedule = await prisma.schedule.findFirst({
        where: { id },
    });

    if (!schedule) {
        throw new Error("Schedule not found");
    }

    // If found, update it
    const updatedSchedule = await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
            startDateTime,
            endDateTime,
        },
    });

    return updatedSchedule;
};


const deleteSchedule = async (id: string) => {
    const exists = await prisma.schedule.findUnique({
        where: {
            id
        }
    })


    if (!exists) {
        throw new AppError(StatusCodes.NOT_FOUND, "Schedule not found")
    }

    const result = await prisma.schedule.delete({
        where: {
            id
        }
    })

    return result
}






export const scheduleService = {
    createSchedule, updateSchedule, deleteSchedule, getScheduleById, getAllSchedule
}