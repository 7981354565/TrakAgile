import React from 'react';
import '../Css/ManagerTaskView.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ManageraskView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { task } = location.state || {};
    console.log(task);

    return (
        <div className='task-page'>
            <div className='empl-create-headings'><center><h5>Task Information</h5></center></div>
            <div className='justify-content-between'>
                {task ? (
                    <>
                        <div className='p-1'><strong>ID :</strong> {task.taskId}</div>
                        <div className='p-1'><strong>Title :</strong> {task.title}</div>
                        <div className='p-1'><strong>Description :</strong> {task.description}</div>
                        <div className='p-1'><strong>Status :</strong> {task.status}</div>
                        <div className='p-1'><strong>Package :</strong> {task.packge || 'N/A'}</div>
                        {/* Render coordinates if it exists */}
                        {task.coordinates && (
                            <div className='p-1'>
                                <strong>Coordinates:</strong> 
                                {` (${task.coordinates.type}, ${task.coordinates.coordinates.join(', ')})`}
                            </div>
                        )}
                        {/* Add other task properties here */}
                    </>
                ) : (
                    <div>No task data available.</div>
                )}
            </div>
        </div>
    );
};

export default ManageraskView;
