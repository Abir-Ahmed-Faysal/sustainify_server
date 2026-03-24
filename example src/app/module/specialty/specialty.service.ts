import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllSpecialty = async (): Promise<Specialty[]> => {
    const specialty = await prisma.specialty.findMany()
    return specialty
}




const updateSpecialty = async (id:string,payload:Partial<Specialty>): Promise<Specialty> => {

    const specialty = await prisma.specialty.update({
        where:{id},
        data: payload
    })

    return specialty

}


const createSpecialty = async (payload: Specialty): Promise<Specialty> => {

    const specialty = await prisma.specialty.create({
        data: payload
    })

    return specialty
}

const deleteSpecialty = async (id:string): Promise<Specialty> => {

    const specialty = await prisma.specialty.delete({
        where:{id},
    })
    return specialty

}



export const specialtyService= { createSpecialty,getAllSpecialty ,updateSpecialty,deleteSpecialty } 