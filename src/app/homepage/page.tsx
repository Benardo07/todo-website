"use client";

import Image from "next/image";
import { FiFilter } from 'react-icons/fi';
import { useState, ChangeEvent, useEffect } from "react";
import { api } from "~/trpc/react";
import { toast } from 'react-hot-toast';
import TaskPopup, { Task } from "../_components/taskPopup";


export default function Home() {
const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState('all');
  const { data: tasks, refetch } = api.task.getAll.useQuery();
  const markTaskDone = api.task.markDone.useMutation();
  const deleteTask = api.task.delete.useMutation();

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 30000);  // Refresh every minute

    return () => clearInterval(intervalId);  // Clean up the interval on component unmount
  }, [refetch]);
  const handleMarkDone = async (id : string) => {
    try {
      await markTaskDone.mutateAsync({ id });
      refetch();
      toast.success('Task marked as done!');
    } catch (error) {
      toast.error('Failed to mark task as done.');
    }
  };

  const handleDelete = async (id : string) => {
    try {
      await deleteTask.mutateAsync({ id });
      refetch();
      toast.success('Task deleted!');
    } catch (error) {
      toast.error('Failed to delete task.');
    }
  };

  const handleEditClick = (task: Task) => {
    setCurrentTask(task);
    setOpenForm(true);
  }

  const handleAddTask = () => {
    setCurrentTask(null);
    setOpenForm(true);
  }

  const isPastDue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && !task.isDone;
  };

  const filteredTasks = tasks?.filter(task => {
    const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return filter === 'all' ? searchMatch : searchMatch && (filter === 'done' ? task.isDone : !task.isDone);
  }) || [];

  return (
    <main className="flex min-h-screen w-3/4 max-w-[1000px] flex-col items-center justify-center text-white">
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
      <ul className="mb-4 w-full">
        {filteredTasks.map((task, index) => (
          <li key={index} className={`p-4 rounded mb-2 flex flex-row justify-between items-center w-full ${task.isDone ? 'bg-white bg-opacity-5' : 'bg-white bg-opacity-20'} ${isPastDue(task) ? 'border-red-500 border-2 shadow-inner shadow-red-500/50' : ''}`}>
            <div className={`flex-col gap-2 ${task.isDone ? 'line-through' : ''}`}>
                <div className="font-bold">{task.title}</div>
                {task.description && <div className="text-sm">{task.description}</div>}
                {task.dueDate && <div className="text-sm">Due: {new Date(task.dueDate).toLocaleString()} {isPastDue(task) ? <span className="text-red-500"> - Passed Due Time</span> : ''}</div>}
            </div>
            <div className="flex flex-row items-center gap-4">
                {!task.isDone && (
                    <button onClick={() => handleEditClick(task)}  className="bg-black px-5 py-3 rounded-full hover:bg-slate-800 duration-300">Edit</button>
                )}
                {task.isDone ? (
                  <span className="px-5 py-3 rounded-full bg-gray-500">Done</span>
                ) : (
                  
                  <button onClick={() => handleMarkDone(task.id)} className="bg-black px-5 py-3 rounded-full hover:bg-slate-800 duration-300">Mark As Done</button>
                )}
                <button onClick={() => handleDelete(task.id)}>
                    <Image src="/delete.png" alt="Delete" width={50} height={50}></Image>
                </button>
            </div>
          </li>
        ))}
      </ul>
      {openForm && <TaskPopup refetch={refetch} onClose={setOpenForm} task={currentTask} />}
    </main>
  );
}

