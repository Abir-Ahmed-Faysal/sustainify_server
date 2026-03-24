import { isValid, parse } from "date-fns";

export const convertToDateTime = (dateString: string | undefined) => {

   
    if (!dateString) {
        console.log("here is the 1rd undefined");
        return undefined;
    }

    const date = parse(dateString, "yyyy-MM-dd", new Date());

    if (!isValid(date)) {

        console.log("here is the 2rd undefined",);
        return undefined;
    }

    console.log("here is the 3rd", date);

    return date;
}