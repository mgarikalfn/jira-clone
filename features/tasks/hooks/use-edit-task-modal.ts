import {useQueryState,parseAsBoolean, parseAsString} from "nuqs";

export const useEditTaskModal = () => {
    const [taskId , setTaskId] = useQueryState(
        "edit-task",
        parseAsString.withDefault("").withOptions({ clearOnDefault: true })
    );



    const open = (id:string) => setTaskId(id);
    const close = () => setTaskId("");


    return {
        taskId,open,close,setTaskId
    }
}