import {useQueryState,parseAsBoolean, parseAsString} from "nuqs";

export const useEditTaskModal = () => {
    const [taskId , setTaskId] = useQueryState(
        "create-task",
        parseAsString,
    );



    const open = (id:string) => setTaskId(id);
    const close = () => setTaskId(null);


    return {
        taskId,open,close,setTaskId
    }
}