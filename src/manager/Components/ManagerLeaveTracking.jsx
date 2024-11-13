import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Table, Container, Row, Col, Pagination } from "react-bootstrap";
import { FaFileExcel, FaSearch } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Import xlsx library
import '../Css/ManagerLeaveTracking.css';

const ManagerLeaveTracking = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [name, setName] = useState(""); // State for name input
  const [leaveType, setLeaveType] = useState(""); // State for leave type input

  // Fetch all leave requests on component mount
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get("http://68.183.86.1:8080/trackagile/leave/leaveDisplay");
        if (response.data.status === "OK") {
          setLeaveRequests(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchLeaveRequests();
  }, []);

  // Filter leave requests based on name and leave type
  const filteredLeaveRequests = leaveRequests.filter(request => {
    const nameMatch = name ? request.name?.toLowerCase().includes(name.toLowerCase()) : true;
    const typeMatch = leaveType ? request.leaveType === leaveType : true;
    return nameMatch && typeMatch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaveRequests = filteredLeaveRequests.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Export functionality
  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredLeaveRequests); // Convert JSON data to worksheet
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, "Leave Requests"); // Append the worksheet
    XLSX.writeFile(wb, "Leave_Requests.xlsx"); // Generate and download the Excel file
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to the first page on search
  };

  return (
    <Container className="LeaveRequestPage" style={{ padding: "20px" }}>
      <Row className="mb-3">
        <Col>
          <Form.Group as={Row} controlId="formName" className="align-items-center">
            <Form.Label column sm="3" className="lablesNames">Name</Form.Label>
            <Col sm="8">
              <Form.Control className="alignment"
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Col>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group as={Row} controlId="formLeaveType" className="align-items-center">
            <Form.Label column sm="5" className="lablesNames">Leave Type</Form.Label>
            <Col sm="7">
              <Form.Select className="alignment"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="">Leave Type</option>
                <option value="fever">Fever</option>
                <option value="marriage">Marriage</option>
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="personal">Personal Leave</option>
              </Form.Select>
            </Col>
          </Form.Group>
        </Col>

        <Col className="d-flex align-items-end">
          <Button variant="primary" onClick={handleSearch} className="search-buttn alignment">
            Search <FaSearch />
          </Button>
        </Col>

        <Col className="d-flex align-items-end">
          <Button variant="secondary" onClick={handleExportToExcel} className="ExportToExcel alignment">
            Export to Excel <FaFileExcel />
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="tableFirstRow">
        <thead>
          <tr>
            <th>Name</th>
            <th>Request Date</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>No. of Leaves</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentLeaveRequests.length > 0 ? (
            currentLeaveRequests.map((request, index) => (
              <tr key={index}>
                <td>{request.name || "N/A"}</td> {/* Assuming 'name' is not included in the response */}
                <td>{request.requestDate}</td>
                <td>{request.leaveType}</td>
                <td>{request.startDate}</td>
                <td>{request.endDate}</td>
                <td>{request.noOfLeaves}</td>
                <td>{request.status || "Pending"}</td> {/* Default status if not provided */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">No data available</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="pagenation">
        <Pagination className="justify-content-start">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          />
          {Array.from({ length: Math.ceil(filteredLeaveRequests.length / itemsPerPage) }).map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={currentPage === index + 1}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={indexOfLastItem >= filteredLeaveRequests.length}
            onClick={() => handlePageChange(currentPage + 1)}
          />
        </Pagination>
      </div>
    </Container>
  );
};

export default ManagerLeaveTracking;
