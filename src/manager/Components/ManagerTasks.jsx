import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Pagination, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import {FaCircle, FaCheck } from 'react-icons/fa';
import { FaPlus, FaFileExcel, FaEye, FaSearch } from 'react-icons/fa';
import { BiSolidPencil } from "react-icons/bi";
import '../Css/ManagerTasks.css';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const ManagerTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        taskType: '',
        title: '',
        description: '',
        causeCode: '',
        assignedTo: '',
        ttNumber: '',
        country: 'india',
        countryState: 'telangana',
        userPackage: '',
        zonal: '',
        district: '',   
        mandal: ''
    });

    const [currentTasks, setCurrentTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://68.183.86.1:8080/trackagile/task/getAllTasks');
                const result = await response.json();

                if (result.status === 'OK') {
                    setTasks(result.data);
                    setCurrentTasks(result.data); // Initial display of all tasks
                } else {
                    console.error('Failed to fetch tasks:', result.message);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, []);

    const handleSearch = () => {
        const filteredTasks = tasks.filter(task =>
            Object.values(task).some(value =>
                value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setCurrentTasks(filteredTasks);
    };

    const handleTaskTypeFilter = (type) => {
        const filteredTasks = tasks.filter((task) => task.type === type);
        setCurrentTasks(filteredTasks);
    };

    const handleEditTask = (task) => {
        navigate('/task-update', { state: { task } });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiEndpoint = 'http://68.183.86.1:8080/trackagile/task/createTask';
    
        const taskData = {
            taskId: '',
            title: formData.title,
            description: formData.description,
            causeCode : formData.causeCode,
            ttNumber: formData.ttNumber,
            packge: formData.userPackage,
            type: formData.taskType,
            assignedTo: formData.assignedTo,
            zonal: formData.zonal,
            district:  formData.district,
            mandal: formData.mandal
        };
    
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });
    
            if (response.ok) {
                console.log('Task created successfully', await response.json());
    
                // Show success alert
                alert('Task saved successfully!');
    
                // Reset form data
                setFormData({
                    taskType: '',
                    title: '',
                    description: '',
                    causeCode:'',
                    ttNumber: '',
                    assignedTo: ''
                });
    
                setShowForm(false);
            } else {
                console.error('Failed to create task', response.status);
                alert('Failed to save task. Please try again.');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Error occurred while saving the task.');
        }
    };
    
    const handleCreateTaskClick = () => {
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
    };

    const handleExportToExcel = () => {
        if (!Array.isArray(tasks) || tasks.length === 0) {
            console.error("No tasks data to export.");
            return; // Prevent exporting if no data
        }

        try {
            const ws = XLSX.utils.json_to_sheet(tasks);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Tasks");
            XLSX.writeFile(wb, "tasks.xlsx");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
        }
    };

    const [errors, setErrors] = useState({});
    const [taskTypes, setTaskTypes] = useState([]); // State to store task types
    useEffect(() => {
        const fetchTaskTypes = async () => {
          try {
            const response = await axios.get('http://68.183.86.1:8080/trackagile/task/init');
            if (response.data.status === 'OK') {
              setTaskTypes(response.data.data.taskTypes); // Set task types from API response
            }
          } catch (error) {
            console.error('Failed to fetch task types:', error); // Log the error to the console
          }
        };
    
        fetchTaskTypes(); // Call the function to fetch task types
      }, []);

    const [packages, setPackages] = useState([]);
    const [zones, setZones] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);

            // Fetch packages based on selected state
            useEffect(() => {
                if (formData.countryState) {
                    const fetchPackages = async () => {
                        try {
                            const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.country}/states/${formData.countryState}/pkgs`);
                            setPackages(response.data);
                            setFormData((prev) => ({ ...prev, userPackage: '', zonal: '', district: '', mandal: ''}));
                        } catch (error) {
                            console.error("Error fetching packages:", error);
                        }
                    };
                    fetchPackages();
                }
            }, [formData.countryState]);
    
            // Fetch zones based on selected package
            useEffect(() => {
                if (formData.userPackage) {
                    const fetchZones = async () => {
                        try {
                            const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.country}/states/${formData.countryState}/pkg/${formData.userPackage}/zone`);
                            setZones(response.data);
                            setFormData((prev) => ({ ...prev, zonal: '', district: '', mandal: ''}));
                        } catch (error) {
                            console.error("Error fetching zones:", error);
                        }
                    };
                    fetchZones();
                }
            }, [formData.userPackage]);
    
            // Fetch districts based on selected zone
            useEffect(() => {
                if (formData.zonal) {
                    const fetchDistricts = async () => {
                        try {
                            const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.country}/states/${formData.countryState}/pkg/${formData.userPackage}/zone/${formData.zonal}/dist`);
                            setDistricts(response.data);
                            setFormData((prev) => ({ ...prev, district: '', mandal: ''}));
                        } catch (error) {
                            console.error("Error fetching districts:", error);
                        }
                    };
                    fetchDistricts();
                }
            }, [formData.zonal]);
    
            // Fetch mandals based on selected district
            useEffect(() => {
                if (formData.district) {
                    const fetchMandals = async () => {
                        try {
                            const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.country}/states/${formData.countryState}/pkg/${formData.userPackage}/zone/${formData.zonal}/districts/${formData.district}/mandals`);
                            setMandals(response.data);
                            setFormData((prev) => ({ ...prev, mandal: ''}));
                        } catch (error) {
                            console.error("Error fetching mandals:", error);
                        }
                    };
                    fetchMandals();
                }
            }, [formData.district]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
    
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value // Dynamically update the fields in formData
        }));
    };
        
      // State and Variables for "Assigned To" field
  const [employeesList, setEmployeesList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [chosenEmployee, setChosenEmployee] = useState(null); // Track the selected employee
  const [finalEmployee, setFinalEmployee] = useState(null); // Track confirmed employee for final update

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

    const [page, setPage] = useState(1);
    const [perPage] = useState(9);

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedTasks = currentTasks.slice(startIndex, endIndex);

    const totalPages = Math.ceil(tasks.length / perPage);
    const maxPagesToShow = 5;
    const [taskPageGroup, setTaskPageGroup] = useState(0); // Tracks the group of 5 pages for tasks

    const handlePageChange = (newPage) => {
      setPage(newPage);
    };

    const handleTaskPreviousGroup = () => {
      setTaskPageGroup((prev) => Math.max(prev - 1, 0));
      setPage(taskPageGroup * maxPagesToShow + 1); // Reset to the first page in the new group
    };

    const handleTaskNextGroup = () => {
      setTaskPageGroup((prev) => Math.min(prev + 1, Math.floor(totalPages / maxPagesToShow)));
      setPage(taskPageGroup * maxPagesToShow + 1); // Reset to the first page in the new group
    };

    const taskStartPage = taskPageGroup * maxPagesToShow + 1;
    const taskEndPage = Math.min(taskStartPage + maxPagesToShow - 1, totalPages);
    const taskPages = Array.from({ length: taskEndPage - taskStartPage + 1 }, (_, i) => taskStartPage + i);


    // Employee Pagination State
    const [employeePage, setEmployeePage] = useState(1);
    const [employeesPerPage] = useState(5);

    const totalEmployeePages = Math.ceil(filteredEmployeesList.length / employeesPerPage);
    const [employeePageGroup, setEmployeePageGroup] = useState(0); // Tracks the group of 5 pages for employees

    const startEmployeeIndex = (employeePage - 1) * employeesPerPage;
    const endEmployeeIndex = startEmployeeIndex + employeesPerPage;
    const paginatedEmployeesList = filteredEmployeesList.slice(startEmployeeIndex, endEmployeeIndex);

    const handleEmployeePageChange = (pageNumber) => {
      setEmployeePage(pageNumber);
    };

    const handleEmployeePreviousGroup = () => {
      setEmployeePageGroup((prev) => Math.max(prev - 1, 0));
      setEmployeePage(employeePageGroup * maxPagesToShow + 1); // Reset to the first page in the new group
    };

    const handleEmployeeNextGroup = () => {
      setEmployeePageGroup((prev) => Math.min(prev + 1, Math.floor(totalEmployeePages / maxPagesToShow)));
      setEmployeePage(employeePageGroup * maxPagesToShow + 1); // Reset to the first page in the new group
    };

    const employeeStartPage = employeePageGroup * maxPagesToShow + 1;
    const employeeEndPage = Math.min(employeeStartPage + maxPagesToShow - 1, totalEmployeePages);
    const employeePages = Array.from({ length: employeeEndPage - employeeStartPage + 1 }, (_, i) => employeeStartPage + i);

    return (
        
        <Container className='taskcontainer'>
        <div className="task-page-container">
            <Row className="align-items-center mb-3">
            {!showForm && (
                <Col xs={12} md={4} className="task-search-container">
                    <Form.Control
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="task-search-input"
                    />
                    <Button variant="primary" onClick={handleSearch} className="task-search-button">
                        Search <FaSearch />
                    </Button>
                </Col> )}
                <Col xs={12} md={6} className="task-header-container">
                    {!showForm && (
                        <Row className="mb-3">
                            <Col>
                                <Button variant="primary" className="create-employee-btnn" onClick={handleCreateTaskClick}>
                                    <FaPlus style={{ marginRight: '8px' }} /> Create Task
                                </Button>
                                <Button className="export-btn" onClick={handleExportToExcel}>
                                    <FaFileExcel /> Export to Excel
                                </Button>
                            </Col>
                        </Row>
                    )}
                </Col>
            </Row>
            {!showForm && (
                <div className='taskTypeButtons'>
                <Row className="task-type-filter-row mb-4">
                {["Patrolling", "FRT", "PM", "CM", "Fiber Saving"].map((type) => (
                    <Col key={type}>
                        <Button
                            variant="outline-primary"
                            className="task-type-button"
                            onClick={() => handleTaskTypeFilter(type)}
                        >
                            {type}
                        </Button>
                    </Col>
                ))}
            </Row>
                </div>
             )}
        </div>
            {showForm ? (
                
                <Form className="task-form" onSubmit={handleSubmit}>
                                <div className="task-update-header">
                <div className='taskUpdateHeading'><center><h5>Task Create</h5></center></div>   
            </div><br />
            <Form.Group as={Row} controlId="formTaskType">
              <Form.Label column sm="3">
                Task Type <span className='chukkas'>*</span>
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  as="select"
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleInputChange}
                >
                  <option value="">Select a Task Type</option>
                  {taskTypes.map((task) => (
                    <option key={task.id} value={task.listItem}>
                      {task.listItem}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group> <br />

                    <Form.Group as={Row} controlId="formTitle">
                        <Form.Label column sm="3">
                            Title  <span className='chukkas'>*</span>
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
                        </Col>
                    </Form.Group> <br />

                    <Form.Group as={Row} controlId="formDescription">
                        <Form.Label column sm="3">
                            Description  <span className='chukkas'>*</span>
                        </Form.Label>
                        <Col sm="9">
                        <Form.Control
                      as="textarea"
                      rows={1}  
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />                        </Col>
                    </Form.Group> <br />

                    <Form.Group as={Row} controlId="formTtNumber">
                        <Form.Label column sm="3">
                            TT Number  <span className='chukkas'>*</span>
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type="text" name="ttNumber" value={formData.ttNumber} onChange={handleChange} required />
                        </Col>
                    </Form.Group> <br />
                    <Form.Group as={Row} controlId="formCauseCode">
                        <Form.Label column sm="3">
                            Cause Code  <span className='chukkas'>*</span>
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type="text" name="causeCode" value={formData.causeCode} onChange={handleChange} required />
                        </Col>
                    </Form.Group> <br />
                    <Form.Group as={Row} controlId="formAssignedTo">
                        <Form.Label column sm="3">
                            Assigned To <span className='chukkas'>*</span>
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control
                                type="text"
                                name="assignedTo"
                                value={finalEmployee?.empName || ''} // Display confirmed employee's name
                                onClick={() => setShowEmployeeModal(true)} // Open modal on click
                                readOnly // Make the field readonly
                                placeholder="Search Employee"
                                required // Add required attribute for consistency
                            />
                        </Col>
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
                               {/* Employee Pagination */}
                            <div className="pagenation">
                              <Pagination>
                                <Pagination.Prev onClick={() => handleEmployeePageChange(employeePage > 1 ? employeePage - 1 : employeePage)} />
                                                    
                                {employeePageGroup > 0 && (
                                  <Pagination.Item onClick={handleEmployeePreviousGroup}>{"<< Previous 5"}</Pagination.Item>
                                )}
                                
                                {employeePages.map((pageNumber) => (
                                  <Pagination.Item
                                    key={pageNumber}
                                    active={pageNumber === employeePage}
                                    onClick={() => handleEmployeePageChange(pageNumber)}
                                  >
                                    {pageNumber}
                                  </Pagination.Item>
                                ))}
                                
                                {employeePageGroup < Math.floor(totalEmployeePages / maxPagesToShow) && (
                                  <Pagination.Item onClick={handleEmployeeNextGroup}>{"Next 5 >>"}</Pagination.Item>
                                )}
                                
                                <Pagination.Next onClick={() => handleEmployeePageChange(employeePage < totalEmployeePages ? employeePage + 1 : employeePage)} />
                              </Pagination>
                            </div>                            
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
                  </Modal> <br />
                    <Form.Group as={Row} controlId="userPackage">
                                <Form.Label column sm={3}>
                                    Package <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='userPackage'
                                        value={formData.userPackage}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.userPackage}
                                    >
                                        <option value="">Select Package</option>
                                        {packages.map(pkg => (
                                            <option key={pkg.id} value={pkg.pkg}>
                                                {pkg.pkg}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.userPackage}</Form.Control.Feedback>
                                </Col>
                            </Form.Group> <br />
                                    
                            <Form.Group as={Row} controlId="zonal">
                                <Form.Label column sm={3}>
                                    Zonal <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='zonal'
                                        value={formData.zonal}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.zonal}
                                    >
                                        <option value="">Select Zonal</option>
                                        {zones.map(zone => (
                                            <option key={zone.id} value={zone.zone}>
                                                {zone.zone}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.zonal}</Form.Control.Feedback>
                                </Col>
                            </Form.Group> <br />
                                    
                            <Form.Group as={Row} controlId="district">
                                <Form.Label column sm={3}>
                                    District <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='district'
                                        value={formData.district}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.district}
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(district => (
                                            <option key={district.id} value={district.dist}>
                                                {district.dist}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.district}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>  <br />
                                    
                            <Form.Group as={Row} controlId="mandal">
                                <Form.Label column sm={3}>
                                    Mandal <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='mandal'
                                        value={formData.mandal}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.mandal}
                                    >
                                        <option value="">Select Mandal</option>
                                        {mandals.map(mandal => (
                                            <option key={mandal.id} value={mandal.mandal}>
                                                {mandal.mandal}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.mandal}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>

                    <Row className="task-form-buttons">
                        <Col>
                            <Button variant="success" type="submit" className="save-button">
                                Save
                            </Button> &nbsp;&nbsp;
                            <Button variant="danger" type="button" className="cancel-button" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </Col>
                    </Row>
                </Form>
            ) : (
                <div className="employee-table">
                    <Table striped bordered hover className="table table-striped">
                        <thead className="table-header">
                            <tr>
                                <th>Actions</th>
                                <th>Type</th>
                                <th>Title</th>
                                <th>Assigned By</th>
                                <th>Created By</th>
                                <th>Create Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTasks.map((task, index) => (
                                <tr key={index}>
                                    <td>
                                        <center>
                                            <Button variant="link" className="view-icons" onClick={() => handleEditTask(task)}>
                                                <BiSolidPencil />
                                            </Button>
                                            &nbsp; &nbsp;
                                            <Button variant="link" className="view-icons" onClick={() => navigate('/task-view', { state: { task } })}>
                                                <FaEye />
                                            </Button>
                                        </center>
                                    </td>
                                    <td>{task.type}</td>
                                    <td>{task.title}</td>
                                    <td>{task.taskAssignedBy}</td>
                                    <td>{task.taskCreatedBy}</td>
                                    <td>{task.createdDate}</td>
                                    <td>{task.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <div className="pagenation">
                      <Pagination>
                        <Pagination.Prev onClick={() => handlePageChange(page > 1 ? page - 1 : page)} />

                        {taskPageGroup > 0 && (
                          <Pagination.Item onClick={handleTaskPreviousGroup}>{"<< Previous 5"}</Pagination.Item>
                        )}

                        {taskPages.map((pageNumber) => (
                          <Pagination.Item
                            key={pageNumber}
                            active={pageNumber === page}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </Pagination.Item>
                        ))}

                        {taskPageGroup < Math.floor(totalPages / maxPagesToShow) && (
                          <Pagination.Item onClick={handleTaskNextGroup}>{"Next 5 >>"}</Pagination.Item>
                        )}

                        <Pagination.Next onClick={() => handlePageChange(page < totalPages ? page + 1 : page)} />
                      </Pagination>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default ManagerTasks;
