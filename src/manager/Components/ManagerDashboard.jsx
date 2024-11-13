import React, { useState, useEffect } from 'react';
import '../Css/ManagerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUsers,faUserCheck,faUserClock,faUserTimes,faSearch,faExpand,faCompress,faClipboardList,faCheckCircle,faClock,faHourglassHalf} from '@fortawesome/free-solid-svg-icons';
import ManagerMapComponent from './ManagerMapComponent';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const ManagerDashboard = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    lateArrival: 0,
    absent: 0,
    leaveRequests: 0,
  });

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Fetch stats based on selected date
  useEffect(() => {
    const fetchStatsByDate = async () => {
      if (!selectedDate) return;
      try {
        const response = await axios.get(`http://68.183.86.1:8080/trackagile/summary/${selectedDate}`);
        if (response.data.status === 'OK') {
          const data = response.data.data;
          setStats({
            totalEmployees: data.totalEmployeeCount || 0,
            present: data.presentEmployeeCount || 0,
            lateArrival: data.lateArrivalCount || 0,
            absent: data.absentEmployeeCount || 0,
            leaveRequests: stats.leaveRequests, // Keep existing leave requests count if applicable
          });
        }
      } catch (error) {
        console.error('Error fetching stats by date:', error);
      }
    };

    fetchStatsByDate();
  }, [selectedDate]);

   // Fetch employee counts based on the selected package
   useEffect(() => {
    const fetchStatsByPackage = async () => {
      if (!selectedPackage || selectedPackage === 'all') return; // Skip if 'All Packages' is selected
      try {
        const response = await axios.get(`http://68.183.86.1:8080/trackagile/dashboard/package/${selectedPackage}`);
        if (response.data.status === 'OK') {
          const data = response.data.data;
          console.log(response.data);
          setStats((prevStats) => ({
            ...prevStats,
            totalEmployees: data.totalEmployeeCount || 0,
            present: data.presentEmployeeCount || 0,
            lateArrival: data.lateArrivalCount || 0,
            absent: data.absentEmployeeCount || 0,
            leaveRequests: data.totalLeaveRequests || prevStats.leaveRequests, // Use new leave requests count if available
          }));
        }
      } catch (error) {
        console.error('Error fetching stats by package:', error);
      }
    };

    fetchStatsByPackage();
  }, [selectedPackage]);

 // Fetch default stats on component mount and when "All Packages" is selected
 useEffect(() => {
  const fetchDefaultStats = async () => {
    if (selectedPackage === "all") {
      try {
        const response = await axios.get('http://68.183.86.1:8080/trackagile/dashboard/summary');
        if (response.data.status === "OK") {
          const data = response.data.data;
          setStats({
            totalEmployees: data.totalEmployeeCount || 0,
            present: data.presentEmployeeCount || 0,
            lateArrival: data.lateArrivalCount || 0,
            absent: data.absentEmployeeCount || 0,
            leaveRequests: stats.leaveRequests, // Keep existing leave requests count if applicable
          });
        }
      } catch (error) {
        console.error('Error fetching default stats:', error);
      }
    }
  };

  fetchDefaultStats();
}, [selectedPackage]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    setSelectedDate(today); // Set the default date
  }, []);

  const [tasks] = useState([
    {
      name: "Netsa web development",
      project: "Netsa",
      projectManager: "Om Prakesh Rao",
      dueDate: "May 25, 2023",
      status: "New",
      progress: "100%",
    },
    {
      name: "Datascale AI app",
      project: "Datascale",
      projectManager: "Nielsen Mando",
      dueDate: "Jun 20, 2023",
      status: "Done",
      progress: "58%",
    },
    {
      name: "Media channel branding",
      project: "Media Channel",
      projectManager: "Tiruvelly Priya",
      dueDate: "Jul 13, 2023",
      status: "New",
      progress: "0%",
    },
    {
      name: "Corlax iOS app development",
      project: "Corlax",
      projectManager: "Matte Harney",
      dueDate: "Dec 20, 2023",
      status: "Completed",
      progress: "100%",
    },
    {
      name: "Website builder development",
      project: "Website Builder",
      projectManager: "Sukumar Rao",
      dueDate: "Mar 15, 2024",
      status: "Incomplete",
      progress: "0%",
    },
    {
      name: "Media",
      project: "Channel",
      projectManager: "Tiruvelly Priya",
      dueDate: "Jul 13, 2023",
      status: "Work in Progress",
      progress: "90%",
    },
    {
      name: "branding",
      project: "Media Channel",
      projectManager: "Tiruvelly Priya",
      dueDate: "Jul 13, 2023",
      status: "Assigned",
      progress: "30%",
    }
  ]);

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const projectOptions = ["Netsa", "Datascale", "Media Channel", "Corlax", "Website Builder"];
  const managerOptions = ["Om Prakesh Rao", "Nielsen Mando", "Tiruvelly Priya", "Matte Harney", "Sukumar Rao"];
  const statusOptions = ["New", "Done", "Assigned", "Completed", "Incomplete", "Work in Progress"];

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleManagerChange = (e) => {
    setSelectedManager(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    return (
      (selectedProject === '' || task.project === selectedProject) &&
      (selectedManager === '' || task.projectManager === selectedManager) &&
      (selectedStatus === '' || task.status === selectedStatus)
    );
  });

  const navigate = useNavigate(); // Initialize useNavigate

  const handleCardClick = (statName) => {
    // Construct the stat name based on the selected package
    let packageSpecificStatName = statName;
  
    // If a package is selected (not 'all'), prefix the stat name with the selected package
    if (selectedPackage !== 'all') {
      packageSpecificStatName = `${selectedPackage}${statName}`; // e.g., packageAtotalEmployees
    }
  
    // Construct API URL
    const apiUrl = `http://68.183.86.1:8080/trackagile/dashboard/get/${packageSpecificStatName}`;
  
    // Print how the API is being called
    console.log(`API Call: ${apiUrl}`);
  
    // Fetch data
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched employee data:", data);
  
        // Check if the response format is as expected
        if (data && data.status === 'OK' && data.data) {
          // Map statName to the respective key in the response
          let employeeKey;
          switch (statName) {
            case 'present':
              employeeKey = 'presentEmployees';
              break;
            case 'absent':
              employeeKey = 'absentEmployees';
              break;
            case 'leaverequests':
              employeeKey = 'leaveRequests';
              break;
            case 'late':
              employeeKey = 'lateArrivals';
              break;
            case 'totalemployees':
              employeeKey = 'totalEmployees';
              break;
            default:
              console.error(`Unknown statName: ${statName}`);
              return;
          }
  
          // Check if the data contains the expected employee array
          if (Array.isArray(data.data[employeeKey])) {
            // Pass the employee data to the new route
            navigate(`/employees/${statName}`, { state: { data: data.data[employeeKey], statName } });
          } else {
            console.error(`Fetched data does not contain the expected array for ${employeeKey}:`, data);
            alert('Error: Fetched data is not in the expected format.');
          }
        } else {
          console.error('Fetched data is not in the expected format:', data);
          alert('Error: Fetched data is not in the expected format.');
        }
      })
      .catch((error) => console.error('Error fetching data:', error));
  };  
  
  return (
    <div className={`dashboard ${isFullScreen ? 'full-screen' : ''}`}>
       <div className="headerr">
        <div className="search-container">
          <select
            className="package-select"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
          >
            <option value="all">All Packages</option>
            <option value="package A">Package A</option>
            <option value="package B">Package B</option>
            <option value="package C">Package C</option>
          </select>
          <button className="search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <input
           type="date"
           className="date-input"
           value={selectedDate}
           onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      <div className="stats">
      <div className="stat-item" id="card1" onClick={() => handleCardClick('totalemployees')}>
        <FontAwesomeIcon icon={faUsers} className="stat-icon" />
        <div className="stat-value">{stats.totalEmployees}</div>
        <div className="stat-label">Total Employees</div>
      </div>
      <div className="stat-item" id="card2" onClick={() => handleCardClick('present')}>
        <FontAwesomeIcon icon={faUserCheck} className="stat-icon" />
        <div className="stat-value">{stats.present}</div>
        <div className="stat-label">Present</div>
      </div>
      <div className="stat-item" id="card3" onClick={() => handleCardClick('late')}>
        <FontAwesomeIcon icon={faUserClock} className="stat-icon" />
        <div className="stat-value">{stats.lateArrival}</div>
        <div className="stat-label">Late Arrival</div>
      </div>
      <div className="stat-item" id="card4" onClick={() => handleCardClick('absent')}>
        <FontAwesomeIcon icon={faUserTimes} className="stat-icon" />
        <div className="stat-value">{stats.absent}</div>
        <div className="stat-label">Absent</div>
      </div>
      <div className="stat-item" id="card5" onClick={() => handleCardClick('leaverequests')}>
        <FontAwesomeIcon icon={faClipboardList} className="stat-icon" />
        <div className="stat-value">{stats.leaveRequests}</div>
        <div className="stat-label">Leave Requests</div>
      </div>
    </div>
      <div className="map">
      <ManagerMapComponent selectedPackage={selectedPackage} />
      <button className="fullscreen-button" onClick={toggleFullScreen}>
          <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
        </button>
      </div>   
      <div className='dashboardTasks'>
        <div className='tasksHeader'>
          <h5>Tasks</h5>
        </div>
        <div className="stats">
          <div className="stat-item-tasks" id="card6">
            <FontAwesomeIcon icon={faClock} className="stat-icon" />
            <div className="stat-value">{filteredTasks.filter(task => task.status === "New").length}</div>
            <div className="stat-label">New</div>
          </div>
          <div className="stat-item-tasks" id="card7">
            <FontAwesomeIcon icon={faCheckCircle} className="stat-icon" />
            <div className="stat-value">{filteredTasks.filter(task => task.status === "Assigned").length}</div>
            <div className="stat-label">Assigned</div>
          </div>
          <div className="stat-item-tasks" id="card8">
            <FontAwesomeIcon icon={faClock} className="stat-icon" />
            <div className="stat-value">{filteredTasks.filter(task => task.status === "Work in Progress").length}</div>
            <div className="stat-label">Work in Progress</div>
          </div>
          <div className="stat-item-tasks" id="card9">
            <FontAwesomeIcon icon={faHourglassHalf} className="stat-icon" />
            <div className="stat-value">{filteredTasks.filter(task => task.status === "Incomplete").length}</div>
            <div className="stat-label">Incomplete</div>
          </div>
          <div className="stat-item-tasks" id="card10">
            <FontAwesomeIcon icon={faCheckCircle} className="stat-icon" />
            <div className="stat-value">{filteredTasks.filter(task => task.status === "Completed").length}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-item-tasks" id="card11">
            <FontAwesomeIcon icon={faClipboardList} className="stat-icon" />
            <div className="stat-value">{filteredTasks.filter(task => task.status === "Done").length}</div>
            <div className="stat-label">Done</div>
          </div>
        </div>
        <div className='filters'>
          <select value={selectedProject} onChange={handleProjectChange} className='filter-select'>
            <option value="">All Projects</option>
            {projectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={selectedManager} onChange={handleManagerChange} className='filter-select'>
            <option value="">All Managers</option>
            {managerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={selectedStatus} onChange={handleStatusChange} className='filter-select'>
            <option value="">All Statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <table className='tasksTable-dashboard'>
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Project Manager</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, index) => (
              <tr key={index}>
                <td>{task.name}</td>
                <td>{task.projectManager}</td>
                <td>{task.dueDate}</td>
                <td>{task.status}</td>
                <td>
                  <div className='progress'>
                    <div className='progressBar' style={{ width: task.progress }}></div>
                  </div>
                  {task.progress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerDashboard;
