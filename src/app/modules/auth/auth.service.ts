import bcrypt from "bcryptjs"
import { prisma } from "../../lib/prisma"

const register = async (payload: any) => {
    const { name, email, password } = payload
    try {
        const hashPassword = await bcrypt.hash(password, 10)

        const UserExists = await prisma.User.findUnique({
            where: {
                email
            }
        })

        if(UserExists){
            throw new Error("User already exists")
        }


const user = prisma.user.create({
    data:{
        name,
        email,
        password:hashPassword
    }
})






await prisma.$transaction(async (tx) => {
    
})





    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    }

}

export const authService = {
    register
}