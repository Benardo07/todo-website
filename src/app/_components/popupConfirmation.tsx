
interface PropsData {
    handleDelete: () => void;
    handleCancel: (status: boolean) => void;
    message: string;
}

export default function PopUpConfimation({handleDelete, handleCancel, message} : PropsData){
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
            <div className=" w-[300px] md:w-[400px] h-[250px] rounded-3xl bg-black flex flex-col p-10 gap-20">
                <p className="font-bold text-xl">Are you sure want to undo this {} ?? </p>
                <div className="flex flex-row gap-10">
                        <button onClick={handleDelete} className="bg-[#2e026d] hover:bg-opacity-75 transition duration-300 ease-in-out text-white rounded-full px-5 py-3">
                            Undo
                        </button>
                        <button onClick={() => handleCancel(false)} className="bg-white hover:bg-opacity-75 transition duration-300 ease-in-out text-black rounded-full px-5 py-3">
                            Cancel
                        </button>
                </div>
            </div>
            
        </div>
    )
    
}