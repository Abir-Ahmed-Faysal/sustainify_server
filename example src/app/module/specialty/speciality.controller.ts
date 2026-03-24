import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../shared/catchAsync";
import { sendRes } from "../../shared/sendRes";
import { specialtyService } from "./specialty.service";

const getAllSpecialty = catchAsync(async (req, res) => {
    const result = await specialtyService.getAllSpecialty();

    if (!result) {
        return sendRes(res, { statusCode: StatusCodes.NOT_FOUND, message: "Failed to fetch specialties", success: false });
    }
    return sendRes(res, { statusCode: StatusCodes.OK, message: "Specialties fetched successfully", success: true, data: result });
});

const createSpecialty = catchAsync(async (req, res) => {
    const payload = { ...req.body, icon: req.file?.path };

    const result = await specialtyService.createSpecialty(payload);

    if (!result) {
        return sendRes(res, { statusCode: StatusCodes.NOT_FOUND, message: "Failed to create a new specialty", success: false });
    }
    return sendRes(res, {
        statusCode: StatusCodes.CREATED, message: "Specialty created successfully", success: true,
        data: result
    });
});

const updateSpecialty = catchAsync(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await specialtyService.updateSpecialty(id as string, payload);

    if (!result) {
        return sendRes(res, { statusCode: StatusCodes.NOT_FOUND, message: "Failed to update specialty", success: false });
    }
    return sendRes(res, { statusCode: StatusCodes.OK, message: "Specialty updated successfully", success: true, data: result });
});

const deleteSpecialty = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await specialtyService.deleteSpecialty(id as string);

    if (!result) {
        return sendRes(res, { statusCode: StatusCodes.NOT_FOUND, message: "Failed to delete specialty", success: false });
    }
    return sendRes(res, { statusCode: StatusCodes.OK, message: "Specialty deleted successfully", success: true, data: result });
});

export const specialtyController = {
    createSpecialty,
    getAllSpecialty,
    updateSpecialty,
    deleteSpecialty,
};
