import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Pagination, Container, Row, Col, Form, Modal } from 'react-bootstrap';
import {FaCircle, FaCheck } from 'react-icons/fa';
import { FaPlus, FaFileExcel, FaEye, FaSearch } from 'react-icons/fa';
import { BiSolidPencil } from "react-icons/bi";
import './Tasks.css';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        taskType: '',
        title: '',
        description: '',
        causeCode: '',
        ipAddress: '',
        lgdCode: '',
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

    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const maxPagesToShow = 5;
    const [taskPageGroup, setTaskPageGroup] = useState(0);

    // Fetch tasks based on the page number
    const fetchTasks = async (page) => {
        try {
            const response = await fetch(`http://68.183.86.1:8080/trackagile/task/getAllTasks/${page-1}/9`);
            const result = await response.json();

            if (result.status === 'OK') {
                setTasks(result.data.tasks); // Update based on the correct key from the API response
                setTotalPages(result.data.totalPages); // Ensure total pages are set correctly
                setPageNumber(page);
            } else {
                console.error('Failed to fetch tasks:', result.message);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks(pageNumber);
    }, [pageNumber]);

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setPageNumber(page);
        }
    };

    // Handle next and previous groups of 5 pages
    const handleTaskNextGroup = () => {
        if (taskPageGroup < Math.floor(totalPages / maxPagesToShow)) {
            setTaskPageGroup(taskPageGroup + 1);
        }
    };

    const handleTaskPreviousGroup = () => {
        if (taskPageGroup > 0) {
            setTaskPageGroup(taskPageGroup - 1);
        }
    };

    // Generate pages to display based on the current group
    const taskPages = Array.from(
        { length: Math.min(maxPagesToShow, totalPages - taskPageGroup * maxPagesToShow) },
        (_, index) => taskPageGroup * maxPagesToShow + index + 1
    );
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
            ipAddress: formData.ipAddress,
            lgdCode: formData.lgdCode,
            ttNumber: formData.ttNumber,
            packge: formData.userPackage,
            type: formData.taskType,
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
                    causeCode: '',
                    ipAddress: '',
                    lgdCode: '',
                    ttNumber: '',
                    userPackage: '',
                    zonal: '',
                    district: '',   
                    mandal: ''
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
                    <Form.Group as={Row} controlId="formIpAddress">
                        <Form.Label column sm="3">
                            Ip  Address <span className='chukkas'>*</span>
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type="text" name="ipAddress" value={formData.ipAddress} onChange={handleChange} required />
                        </Col>
                    </Form.Group> <br />
                    <Form.Group as={Row} controlId="formIpAddress">
                        <Form.Label column sm="3">
                            Lgd Code <span className='chukkas'>*</span>
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type="text" name="lgdCode" value={formData.lgdCode} onChange={handleChange} required />
                        </Col>
                    </Form.Group> <br />
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
        <>
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
                    {tasks.map((task, index) => (
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

            {/* Pagination */}
            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination>
                    <Pagination.Prev onClick={() => handlePageChange(pageNumber > 1 ? pageNumber - 1 : pageNumber)} />

                    {taskPageGroup >= 0 && (
                        <Pagination.Item onClick={handleTaskPreviousGroup}>{"<< Previous 5"}</Pagination.Item>
                    )}

                    {taskPages.map((page) => (
                        <Pagination.Item
                            key={page}
                            active={page === pageNumber}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </Pagination.Item>
                    ))}

                    {taskPageGroup < Math.floor(totalPages / maxPagesToShow) && (
                        <Pagination.Item onClick={handleTaskNextGroup}>{"Next 5 >>"}</Pagination.Item>
                    )}

                    <Pagination.Next onClick={() => handlePageChange(pageNumber < totalPages ? pageNumber + 1 : pageNumber)} />
                </Pagination>
            </div>
        </>
                </div>
            )}
        </Container>
    );
};

export default Tasks;
