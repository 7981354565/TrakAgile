import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Table, Row, Col, Tabs, Tab, Modal } from 'react-bootstrap';
import { Pagination } from 'react-bootstrap'; // Ensure Pagination is imported
import WorkInformation from '../Components/ManagerWorkInformation';
import {FaCircle, FaCheck } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import '../Css/ManagerTaskUpdate.css';

function ManagerTaskUpdateForm({ onClose, taskId }) {
  const location = useLocation();
  const task = location.state?.task || {}; // Retrieve task data from location state
  
  const [formData, setFormData] = useState({
    taskId: task.taskId || '',
    taskType: task.type || '',
    subType: task.subType || '',
    status: task.status || '',
    package: task.packge || '',
    zonal: task.zonal || '',
    district: task.district || '',
    mandal: task.mandal || '',
    title: task.title || '',
    workType: task.workType || '',
    assignedTo: task.taskAssignedTo || '',
    createdBy: task.taskCreatedBy || '',
    assignedBy: task.taskAssignedBy || '',
    createdDate: task.createdDate || '',
    createdTime: task.createdTime || '',
    workStartTime: task.workStartTime || '',
    workEndTime: task.workEndTime || '',
    taskEndTime: task.taskEndTime || '',
    location: task.location || '',
    reportedBy: task.reportedBy || '',
    ttNumber: task.ttNumber || '',
    description: task.description || '',
  });

  // Update formData when the task changes on component mount
  useEffect(() => {
    if (task) {
      setFormData({
        taskId: task.taskId || '',
        taskType: task.taskType || '',
        subType: task.subType || '',
        status: task.status || '',
        package: task.packge || '',
        zonal: task.zonal || '',
        district: task.district || '',
        mandal: task.mandal || '',
        title: task.title || '',
        workType: task.workType || '',
        assignedTo: task.taskAssignedTo || '',
        createdBy: task.taskCreatedBy || '',
        assignedBy: task.taskAssignedBy || '',
        createdDate: task.createdDate || '',
        createdTime: task.createdTime || '',
        workStartTime: task.workStartTime || '',
        workEndTime: task.workEndTime || '',
        taskEndTime: task.taskEndTime || '',
        location: task.location || '',
        reportedBy: task.reportedBy || '',
        ttNumber: task.ttNumber || '',
        description: task.description || '',
      });
    }
  }, [task]);
  const [key, setKey] = useState('task'); // state to manage active tab
  const [incidentSummary, setIncidentSummary] = useState([]);

  useEffect(() => {
    if (task) {
      setFormData(task); // Initialize form data with the selected task

      // Fetch incident summary
      axios
        .get('/api/incidents/summary')
        .then((response) => setIncidentSummary(response.data))
        .catch((error) => console.error('Error fetching incident summary:', error));
    }
  }, [task]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    axios
      .post('/api/tasks/update', formData)
      .then((response) => {
        alert('Task updated successfully!');
        onClose(); // Close the form after successful update
      })
      .catch((error) => console.error('Error updating task:', error));
  };

  const [note, setNote] = useState('');
  const [notesHistory, setNotesHistory] = useState([]);

  // Fetch notes history when the component mounts or when taskId changes
  useEffect(() => {
    fetchNotesHistory();
  }, [task.taskId]);

  // Function to fetch notes history from the API
  const fetchNotesHistory = async () => {
    try {
      const response = await axios.get(`/api/notes/${task.taskId}`); // Update with your actual endpoint
      setNotesHistory(response.data); // Assume the response data is an array of notes
    } catch (error) {
      console.error('Error fetching notes history:', error);
    }
  };

  // Function to handle the save button click
  const handleSaveNote = async () => {
    if (!note) {
      alert('Please enter a note before saving.');
      return;
    }
    
    try {
      await axios.post('/api/notes', { taskId, note }); // Update with your actual endpoint
      setNote(''); // Clear the input field after saving
      fetchNotesHistory(); // Refresh the notes history
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // State and Variables for "Assigned To" field
  const [employeesList, setEmployeesList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [chosenEmployee, setChosenEmployee] = useState(null); // Track the selected employee
  const [finalEmployee, setFinalEmployee] = useState(null); // Track confirmed employee for final update

  // Pagination state for employees
  const [employeePage, setEmployeePage] = useState(1);
  const [employeesPerPage] = useState(5); // Number of records per page

  // Fetch employee details when the modal opens
  useEffect(() => {
      const fetchEmployees = async () => {
          try {
              const response = await fetch(`http://68.183.86.1:8080/trackagile/employee/empByMandal/34`);
              const data = await response.json();
              if (data.status === 'OK' && data.data) {
                  setEmployeesList(data.data);
              } else {
                  console.error('Error fetching employee data:', data.message);
              }
          } catch (error) {
              console.error('Error fetching employee data:', error);
          } finally {
              setLoadingEmployees(false);
          }
      };

      if (showEmployeeModal) fetchEmployees(); // Only fetch employees when the modal opens
  }, [showEmployeeModal, formData.taskId]);

  // Handle employee selection (circle click)
  const handleEmployeeSelection = (employee) => {
      setChosenEmployee(employee); // Set selected employee when circle is clicked
  };

  // Handle final confirmation when the button is clicked
  const handleConfirmEmployeeSelection = () => {
      if (chosenEmployee) {
          setFinalEmployee(chosenEmployee); // Store the confirmed employee
          handleInputChange({
              target: {
                  name: 'assignedTo',
                  value: chosenEmployee.empName, // Only set the employee's name in the form
              },
          });
          setShowEmployeeModal(false); // Close modal after confirming
      }
  };

  // Filter employees based on search term
  const filteredEmployeesList = employeesList.filter((employee) =>
      employee.empName.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.empId.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.phone.includes(employeeSearchTerm) ||
      employee.designation.toLowerCase().includes(employeeSearchTerm.toLowerCase()) 
  );

  // Calculate total pages for pagination
  const totalEmployeePages = Math.ceil(filteredEmployeesList.length / employeesPerPage);

  // Calculate start and end indices for paginated data
  const startEmployeeIndex = (employeePage - 1) * employeesPerPage;
  const endEmployeeIndex = startEmployeeIndex + employeesPerPage;
  const paginatedEmployeesList = filteredEmployeesList.slice(startEmployeeIndex, endEmployeeIndex);

  // Handle page change for employee pagination
  const handleEmployeePageChange = (pageNumber) => {
      setEmployeePage(pageNumber);
  };

  const [taskTypes, setTaskTypes] = useState([]); // State to store task types
  const [taskSubTypes, setTaskSubTypes] = useState([]); // State to store task sub types
  const [taskStatus, setTaskStatus] = useState([]); // State to store task status

  // Fetch dropdown options from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://68.183.86.1:8080/trackagile/task/init');
        if (response.data.status === 'OK') {
          setTaskTypes(response.data.data.taskTypes); // Set task types
          setTaskSubTypes(response.data.data.taskSubTypes); // Set task sub types
          setTaskStatus(response.data.data.taskStatus); // Set task status
        }
      } catch (error) {
        console.error('Failed to fetch data:', error); // Log any errors
      }
    };

    fetchData(); // Fetch data when component mounts
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [images, setImages] = useState({
    reportedList: [],
    wipList: [],
    completedList: [],
    faultMaterialList: [],
    newMaterialList: [],
  });
  const [activeMaterialTab, setActiveMaterialTab] = useState('newMaterials');

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch('http://68.183.86.1:8080/trackagile/task/image-retrieve/476');
      const data = await response.json();

      if (data.status === 'OK') {
        setImages(data.data);
      }
    };

    fetchImages();
  }, []);

  const handleImageClick = (src) => {
    setCurrentImage(src);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const [historyData, setHistoryData] = useState([]); // State to store history data
  const [loading, setLoading] = useState(true); // Loading state

  // Function to fetch history data from the API
  const fetchHistoryData = async () => {
    try {
      const response = await fetch('http://68.183.86.1:8080/trackagile/history/get/476');
      const result = await response.json();
      if (result.status === 'OK') {
        setHistoryData(result.data); // Set history data to state
      }
    } catch (error) {
      console.error("Error fetching history data:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchHistoryData(); // Fetch history data when the component mounts
  }, []);

  return (
    <div className="task-update-containerr">
      <div className="task-update-header">
        <div className='taskUpdateHeading'><center><h5>Task Update</h5></center></div>   
      </div>
      <div className="task-update-content" style={{ display: 'flex', justifyContent: 'space-between' }}>
      
      {/* Left Side: Form Section */}
      <div className="task-form-container" style={{ width: '70%' }}> 
        {/* Tabs positioned exactly above the form */}
        <div className="tabs-container">
          <Tabs
            id="controlled-tab"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
          >
            <Tab eventKey="task" title="Task">
              {/* Task Tab Content: Render the form here */}
            </Tab>

            <Tab eventKey="gallery" title="Gallery">
              {/* Gallery Tab Content */}
            </Tab>

            <Tab eventKey="history" title="History">
              {/* History Tab Content */}
            </Tab>

            <Tab eventKey="workInfo" title="WorkInfo">
              {/* Render WorkInformation component when this tab is selected */}
              {key === 'workInfo' && <WorkInformation />}
            </Tab>
          </Tabs>
        </div>
        
        {/* Form Content (only visible for Task Tab) */}
        {key === 'task' && (
          <div className="form-section">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="formTaskId">
                    <Form.Label>Task Id <span className='chukkas'>*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="taskId"
                      value={formData.taskId}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group controlId="formTaskType">
                  <Form.Label>Task Type <span className='chukkas'>*</span></Form.Label>
                  <Form.Control
                    as="select"
                    name="taskType"
                    value={formData.taskType}
                    onChange={handleInputChange}
                  >
                  <option value="">Select a Task Type</option>
                  {taskTypes.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.listItem}
                    </option>
                  ))}
                  </Form.Control>
                </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formSubType">
                    <Form.Label>Sub Type</Form.Label>
                    <Form.Control
                      as="select"
                      name="subType"
                      value={formData.subType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Sub Type</option>
                      {taskSubTypes.map((subType) => (
                        <option key={subType.id} value={subType.listItem}>
                          {subType.listItem}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                    
                {/* Status Dropdown */}
                <Col md={6}>
                  <Form.Group controlId="formStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Control
                      as="select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Status</option>
                      {taskStatus.map((status) => (
                        <option key={status.id} value={status.listItem}>
                          {status.listItem}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                <Form.Group controlId="formTitle">
                    <Form.Label>Title <span className='chukkas'>*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group controlId="formTTNumber">
                    <Form.Label>TT Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="ttNumber"
                      value={formData.ttNumber}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                <Form.Group controlId="formPackage">
                    <Form.Label>Package</Form.Label>
                    <Form.Control
                      type="text"
                      name="package"
                      value={formData.package}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group controlId="formZone">
                    <Form.Label>Zonal <span className='chukkas'>*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="zone"
                      value={formData.zonal}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                <Form.Group controlId="formDistrict">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group controlId="formMandal">
                    <Form.Label>Mandal <span className='chukkas'>*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="mandal"
                      value={formData.mandal}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
               <Row>
               <Form.Group controlId="formDescription">
                    <Form.Label>Description <span className='chukkas'>*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={1}  
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
               </Row>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="formWorkType">
                    <Form.Label>Work Type</Form.Label>
                    <Form.Control
                      type="text"
                      name="workType"
                      value={formData.workType}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  {/* Assigned To field */}
                  <Form.Group controlId="formAssignedTo">
                      <Form.Label>Assigned To</Form.Label>
                      <Form.Control
                          type="text"
                          name="assignedTo"
                          value={finalEmployee?.empName || ''} // Display confirmed employee's name
                          onClick={() => setShowEmployeeModal(true)} // Open modal on click
                          readOnly // Make the field readonly
                          placeholder="Search Employee"
                      />
                  </Form.Group>

                  {/* Modal for employee selection */}
                  <Modal show={showEmployeeModal} onHide={() => setShowEmployeeModal(false)} size="lg" centered>
                      <Modal.Header closeButton>
                          <Modal.Title>Search Employee</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                          {/* Search input */}
                          <Form.Control
                              type="text"
                              placeholder="Search employees..."
                              value={employeeSearchTerm}
                              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                          />
                          {/* Table to display employees */}
                          <Table striped bordered hover>
                              <thead>
                                  <tr>
                                      <th>Select</th> {/* For circle selection */}
                                      <th>Employee ID</th>
                                      <th>Employee Name</th>
                                      <th>Phone</th>
                                      <th>Designation</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {paginatedEmployeesList.map((employee) => (
                                      <tr key={employee.id}>
                                          <td>
                                              {/* Checkmark selection icon */}
                                              {chosenEmployee?.id === employee.id ? (
                                                  <FaCheck
                                                      style={{
                                                          cursor: 'pointer',
                                                          color: 'green', // Highlight selected employee with a green checkmark
                                                      }}
                                                  />
                                              ) : (
                                                  <FaCircle
                                                      onClick={() => handleEmployeeSelection(employee)} // Set selected employee
                                                      style={{
                                                          cursor: 'pointer',
                                                          color: 'gray', // Default color for unselected
                                                      }}
                                                  />
                                              )}
                                          </td>
                                          <td>{employee.empId}</td>
                                          <td>{employee.empName}</td>
                                          <td>{employee.phone}</td>
                                          <td>{employee.designation}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </Table>
                                
                          {/* Pagination Component */}
                          <Pagination>
                              <Pagination.Prev
                                  disabled={employeePage === 1}
                                  onClick={() => handleEmployeePageChange(employeePage - 1)}
                              />
                              {Array.from({ length: totalEmployeePages }).map((_, index) => (
                                  <Pagination.Item
                                      key={index}
                                      active={employeePage === index + 1}
                                      onClick={() => handleEmployeePageChange(index + 1)}
                                  >
                                      {index + 1}
                                  </Pagination.Item>
                              ))}
                              <Pagination.Next
                                  disabled={employeePage === totalEmployeePages}
                                  onClick={() => handleEmployeePageChange(employeePage + 1)}
                              />
                          </Pagination>
                            
                          {/* Confirm Selection Button */}
                          <Button
                              variant="primary"
                              className="mt-3"
                              onClick={handleConfirmEmployeeSelection}
                              disabled={!chosenEmployee} // Disable if no employee is selected
                          >
                              Confirm Selection
                          </Button>
                      </Modal.Body>
                  </Modal>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formCreatedBy">
                    <Form.Label>Created By</Form.Label>
                    <Form.Control
                      type="text"
                      name="createdBy"
                      value={formData.createdBy}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formAssignedBy">
                    <Form.Label>Assigned By</Form.Label>
                    <Form.Control
                      type="text"
                      name="assignedBy"
                      value={formData.assignedBy}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formCreatedDate">
                    <Form.Label>Created Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="createdDate"
                      value={formData.createdDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formCreatedTime">
                    <Form.Label>Created Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="createdTime"
                      value={formData.createdTime}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formWorkStartTime">
                    <Form.Label>Work Start Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="workStartTime"
                      value={formData.workStartTime}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formWorkEndTime">
                    <Form.Label>Work End Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="workEndTime"
                      value={formData.workEndTime}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formTaskEndTime">
                    <Form.Label>Task End Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="taskEndTime"
                      value={formData.taskEndTime}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formLocation">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formReportedBy">
                    <Form.Label>Reported By</Form.Label>
                    <Form.Control
                      type="text"
                      name="reportedBy"
                      value={formData.reportedBy}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>

              </Row>

              <Row>
                <Col md={6}>

                </Col>
              </Row> <br />

              <div className="button-group">
                <center>
                <Button variant="primary" onClick={handleSubmit}>
                  Update Task
                </Button>
                <Button variant="secondary" onClick={onClose} style={{ marginLeft: '10px' }}>
                  Close
                </Button>
                </center>
              </div>
            </Form>
          </div>
        )}
      {key === 'gallery' && (
        <div className="gallery-section">
          {/* Gallery Categories */}
          {['Reported Images', 'WIP Images', 'Completed Images'].map((category, index) => {
          // Determine which list to use based on the category
          let categoryList;
          if (category === 'Reported Images') {
            categoryList = images.reportedList;
          } else if (category === 'WIP Images') {
            categoryList = images.wipList;
          } else {
            categoryList = images.completedList;
          }

          return (
            <div className="gallery-category" key={index}>
              <center><h5 className='galleryH5'>{category}</h5></center>
              <div className="image-gallery">
                {categoryList.map((image) => (
                  <img 
                    key={image.id} 
                    src={image.imgPath} // Use imgPath for the image source
                    alt="Gallery" 
                    className="photo" 
                    onClick={() => handleImageClick(image.imgPath)} // Click to view image in modal
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Materials Section with Tabs */}
        <div className="gallery-category">
          <center><h5 className='galleryH5'>Materials</h5></center>
          <div className="material-tabs">
            <button onClick={() => setActiveMaterialTab('newMaterials')} 
                    className={activeMaterialTab === 'newMaterials' ? 'active' : ''}>
              New Materials
            </button>
            <button onClick={() => setActiveMaterialTab('faultMaterials')} 
                    className={activeMaterialTab === 'faultMaterials' ? 'active' : ''}>
              Fault Materials
            </button>
          </div>
          <div className="image-gallery">
            {(activeMaterialTab === 'newMaterials' ? images.newMaterialList : images.faultMaterialList).map((image) => (
              <img 
                key={image.id} 
                src={image.imgPath} // Use imgPath for the image source
                alt="Materials" 
                className="photo" 
                onClick={() => handleImageClick(image.imgPath)} // Click to view image in modal
              />
            ))}
          </div>
        </div>

        {/* Modal for Fullscreen Image */}
        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Body>
            <img src={currentImage} alt="Fullscreen" style={{ width: '100%', height: 'auto' }} />
          </Modal.Body>
        </Modal>
        </div>
      )}

{key === 'history' && (
          <div className="history-section">
            <h5>History Content goes here...</h5>
            {loading ? (
              <p>Loading...</p> // Show loading text while fetching data
            ) : (
              <ul>
                {historyData.map((item, index) => (
                  <li key={index}>
                    <strong>Action:</strong> {item.actCode} <br />
                    <strong>Description:</strong> {item.description} <br />
                    <strong>Performed By:</strong> {item.performedBy || 'N/A'} <br />
                    <strong>Time:</strong> {item.actTime || 'N/A'} <br />
                    <hr />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      {/* Right Side: Notes Section */}
      <div className="notes-section" style={{ width: '30%' }}> 
        <div className="notesHeading">
          <center><h6>Notes</h6></center>
        </div>
        <br />
        <Form.Label>Enter Notes</Form.Label>
        <Form.Group controlId="formNotes">
          <Form.Control
            as="textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter your note here..."
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSaveNote}>
          Save
        </Button>

        <div className="notes-history">
          <br />
          <div className="notesHeading">
            <center><h6>Notes History</h6></center>
          </div>
          {notesHistory.length > 0 ? (
            <ul>
              {notesHistory.map((noteItem, index) => (
                <li key={index}>{noteItem}</li>
              ))}
            </ul>
          ) : (
            <p>No notes available for this task.</p>
          )}
        </div>
      </div>
    </div>

      {/* Incident Summary Section */}
      <div className="incident-summary-section">
        <h5>Incident Summary</h5>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Assigned To</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {incidentSummary.map((incident, index) => (
              <tr key={index}>
                <td>{incident.title}</td>
                <td>{incident.type}</td>
                <td>{incident.assignedTo}</td>
                <td>{incident.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default ManagerTaskUpdateForm;