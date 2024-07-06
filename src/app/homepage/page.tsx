"use client";

import Image from "next/image";
import { FiFilter } from 'react-icons/fi';
import { useState, ChangeEvent, useEffect } from "react";
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import TaskPopup, { Task } from "../_components/taskPopup";
import PopUpConfimation from "../_components/popupConfirmation";
import Loading from "../loading";


export default function Home() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isLoading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const markTaskDone = api.task.markDone.useMutation();
  const markTaskUnDone = api.task.markUnDone.useMutation();
  const deleteTask = api.task.delete.useMutation();

  const { data: tasks, refetch, isLoading: isFetching } = api.task.getAll.useQuery();
  useEffect(() => {
    const intervalId = setInterval(() => {
      void refetch();
    }, 5000);  

    return () => clearInterval(intervalId);  // Clean up the interval on component unmount
  }, [refetch]);

  const handleMarkDone = async (id : string) => {
    setLoading(true);
    try {
      await markTaskDone.mutateAsync({ id });
      void refetch();
      toast.success('Task marked as done!');
    } catch (error) {
      toast.error('Failed to mark task as done.');
    }finally {
      setLoading(false);
    }
  };

  const handleConfirmUndo = async () => {
    // Call the API to undo the task
    if(currentTask){
      setLoading(true);
      try {
        const id = currentTask.id
        await markTaskUnDone.mutateAsync({ id });
        void refetch();
        toast.success('Task marked as undone!');
      } catch (error) {
        toast.error('Failed to mark task as undone.');
      }finally{
        setShowConfirmModal(false);
        setCurrentTask(null);
        setLoading(false)
      }
    }
    
  };

  const handleDelete = async (id : string) => {
    setLoading(true);
    try {
      await deleteTask.mutateAsync({ id });
      void refetch();
      toast.success('Task deleted!');
    } catch (error) {
      toast.error('Failed to delete task.');
    }finally{
      setLoading(false);
    }
  };

  const handleCancel = (status: boolean) => {
    setCurrentTask(null);
    setShowConfirmModal(status);
  }

  const handleEditClick = (task: Task) => {
    setCurrentTask(task);
    setOpenForm(true);
  }

  const handleAddTask = () => {
    setCurrentTask(null);
    setOpenForm(true);
  }

  const handleMarkDoneClick = (task: Task) => {
    if (task.isDone) {
      setCurrentTask(task);
      setShowConfirmModal(true);  // Show confirmation modal
    } else {
      handleMarkDone(task.id);  // Directly mark as done if not already done
    }
  };

  const isPastDue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && !task.isDone;
  };

  const filteredTasks = tasks?.filter(task => {
    const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return filter === 'all' ? searchMatch : searchMatch && (filter === 'done' ? task.isDone : !task.isDone);
  }) ?? [];

  return (
    <main className="flex min-h-screen w-3/4 max-w-[1000px] flex-col items-center text-white pt-20 md:pt-40 pb-32">
      {showConfirmModal && <PopUpConfimation handleCancel={handleCancel} handleDelete={handleConfirmUndo} message="task"/>}
      <h1 className="text-5xl mb-4 font-bold w-full text-center">Todo App</h1>
      <div className="w-full flex justify-between mb-3">
        <div className="relative ml-2 bg-black text-white px-5 py-3 rounded-xl shadow-2xl">
          <div onClick={() => setShowDropdown(!showDropdown)} className="flex cursor-pointer items-center">
            <FiFilter className="text-white mr-4"/>
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </div>
          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 w-full bg-black rounded shadow-lg z-10">
              <div onClick={() => { setFilter('all'); setShowDropdown(false); }} className="px-4 py-2 text-sm flex items-center cursor-pointer">All</div>
              <div onClick={() => { setFilter('done'); setShowDropdown(false); }} className="px-4 py-2 text-sm flex items-center cursor-pointer">Done</div>
              <div onClick={() => { setFilter('undone'); setShowDropdown(false); }} className="px-4 py-2 text-sm flex items-center cursor-pointer">Undone</div>
            </div>
          )}
        </div>
        <button onClick={() => handleAddTask()} className="text-white bg-black px-5 py-3 shadow-2xl rounded-full">Add New Task</button>
      </div>
      <input
        type="text"
        className="w-full bg-transparent border-2 py-4 mb-4 px-5 rounded text-white"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
       <div className="w-full h-full">
        {isLoading || isFetching? (
          <Loading/>
        ) : (
          <ul className="mb-4 w-full h-full">
            {filteredTasks.map((task, index) => (
              <li key={index} className={`p-4 rounded mb-2 gap-5 flex flex-col lg:flex-row lg:justify-between lg:items-center w-full ${task.isDone ? 'bg-white bg-opacity-5' : 'bg-white bg-opacity-20'} ${isPastDue(task) ? 'border-red-500 border-2 shadow-inner shadow-red-500/50' : ''}`}>
                <div className={`flex-col gap-2 ${task.isDone ? 'line-through' : ''}`}>
                  <div className="font-bold">{task.title}</div>
                  {task.description && <div className="text-sm">{task.description}</div>}
                  {task.dueDate && <div className="text-sm">Due: {new Date(task.dueDate).toLocaleString()} {isPastDue(task) ? <span className="text-red-500"> - Passed Due Time</span> : ''}</div>}
                </div>
                <div className="flex flex-row items-center gap-4">
                  {!task.isDone && (
                    <button onClick={() => handleEditClick(task)} className="bg-black text-sm px-3 py-2 sm:text-base sm:px-5 sm:py-3 rounded-full hover:bg-slate-800 duration-300">Edit</button>
                  )}
                  <button onClick={() => handleMarkDoneClick(task)} className="bg-black text-sm px-3 py-2 sm:text-base sm:px-5 sm:py-3 rounded-full hover:bg-slate-800 duration-300">
                    {task.isDone ? "Undo Done" : "Mark As Done"}
                  </button>
                  <button onClick={() => handleDelete(task.id)}>
                    <Image src="/delete.png" alt="Delete" width={40} height={40}></Image>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
    </div>
      {openForm && <TaskPopup refetch={refetch} onClose={setOpenForm} task={currentTask} />}
    </main>
  );
}

