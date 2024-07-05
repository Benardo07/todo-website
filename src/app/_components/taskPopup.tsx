import { QueryObserverResult } from "@tanstack/react-query";
import { ChangeEvent, useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { api } from "~/trpc/react";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    isDone: boolean | null;
    createdAt: Date;
    updatedAt: Date;
}

interface TaskPopupProps {
    refetch: () => Promise<QueryObserverResult<any, any>>;
    onClose : (status: boolean) => void;
    task: Task | null;
}

interface FormErrors {
    newTask?: string;
    dueDate?: string;
    dueTime?: string;
}

export default function TaskPopup({ refetch, onClose, task }: TaskPopupProps) {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-CA'); // 'en-CA' uses the YYYY-MM-DD format, which is compatible with input[type="date"]
    };
    
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        }); // 'en-GB' ensures time is in 24-hour format, suitable for input[type="time"]
    };

    const [newTask, setNewTask] = useState<string>(task ? task.title : "");
    const [description, setDescription] = useState<string>(task?.description ? task.description : "");
    const [dueDate, setDueDate] = useState<string>(task && task.dueDate ? formatDate(task.dueDate) : "");
    const [dueTime, setDueTime] = useState<string>(task && task.dueDate ? formatTime(task.dueDate) : "");
    const [errors, setErrors] = useState<FormErrors>({});
    const isEditing = !!task;

    console.log(dueTime)
    const validateForm = () => {
        let isValid = true;
        let errors: FormErrors = {};
    
        if (!newTask.trim()) {
            errors['newTask'] = "Task title is required";
            isValid = false;
        }
    
        if ((dueDate && !dueTime) || (!dueDate && dueTime)) {
            if (!dueDate) {
                errors['dueDate'] = "Due date is required when specifying time";
            }
            if (!dueTime) {
                errors['dueTime'] = "Due time is required when specifying date";
            }
            isValid = false;
        }
    
        // Check if the combined due date and time is in the future
        if (dueDate && dueTime) {
            const dueDateTime = new Date(`${dueDate}T${dueTime}`);
            const now = new Date();
            if (dueDateTime <= now) {
                errors['dueTime'] = "Due time must be in the future";
                isValid = false;
            }
        }
    
        setErrors(errors);
        return isValid;
    };

    const addTask = api.task.add.useMutation({
        onSuccess: () => {
          toast.success('New Task Added!');
          refetch().then(() => {}, () => {});
          onClose(false);
        },
        onError:() =>  {
            toast.error('Failed Add New Task');
        }
    });

    const updateTask = api.task.updateTask.useMutation({
        onSuccess: () => {
            toast.success('Task Updated');
            refetch().then(() => {}, () => {});
            onClose(false);
          },
          onError:() =>  {
              toast.error('Failed update Task');
          }
    })

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (validateForm()) {
            let combinedDueDate = dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`) : undefined;
            if(isEditing){
                await updateTask.mutateAsync({
                    id: task.id,
                    title: newTask,
                    description: description,
                    dueDate: combinedDueDate
                })
            }else{
                
                await addTask.mutateAsync({
                    title: newTask,
                    description: description,
                    dueDate: combinedDueDate,
                    isDone: false,
                });
            }
            
            setNewTask("");
            setDescription("");
            setDueDate("");
            setDueTime("");
            setErrors({});
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-black w-3/4 sm:w-[400px]  md:w-[500px] p-10 rounded-2xl flex flex-col gap-5">

                <h1 className="text-3xl font-bold text-white">{isEditing? "Update Task" : "Add New Task"}</h1>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-white">Title</label>
                        <input
                            type="text"
                            className="mb-2 px-5 py-3 rounded text-white bg-transparent border-2 border-gray-300"
                            placeholder="Add new task..."
                            value={newTask}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
                        />
                        {errors.newTask && <span className="text-red-500 text-sm">{errors.newTask}</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-white">Description</label>
                        <input
                            type="text"
                            className="mb-2 px-5 py-3 rounded text-white bg-transparent border-2 border-gray-300"
                            placeholder="Add description"
                            value={description}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex flex-col md:w-1/2 gap-2">
                            <label className="font-bold text-white">Due Date</label>
                            <input
                                type="date"
                                className="mb-2 px-5 py-3 rounded text-white bg-transparent border-2 border-gray-300"
                                value={dueDate}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col md:w-1/2 gap-2">
                            <label className="font-bold text-white">Due Time</label>
                            <input
                                type="time"
                                className="mb-2 px-5 py-3 rounded text-white bg-transparent border-2 border-gray-300"
                                value={dueTime}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setDueTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-row gap-10 items-center justify-center">
                        <button
                            type="submit"
                            className="px-5 py-3 bg-[#2e026d] rounded-full hover:bg-opacity-80 duration-300"
                        >
                            {isEditing? "Update" : "Add"}
                        </button>
                        <button
                            type="reset"
                            onClick={() => onClose(false)}
                            className="px-5 py-3 bg-[#2e026d] rounded-full hover:bg-opacity-80 duration-300"
                        >
                            Cancel
                        </button>
                    </div>
                    
                </form>
            </div>
        </div>
    )
}
