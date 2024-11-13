import React, { useState, useEffect } from 'react';
import { Button, Form, Col, Row, Table, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import '../Css/ManagerSitesMainPage.css';
import { FaEye } from 'react-icons/fa';
import { BiSolidPencil } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';
import ManagerSitesForm from './ManagerSitesForm';

function ManagerSiteMainPage() {
  const [sites, setSites] = useState([]);
  const [siteName, setSiteName] = useState('');
  const [type, setType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6; // Set items per page
  const navigate = useNavigate();

  useEffect(() => {
    fetchSiteData();
  }, []);

  const fetchSiteData = async () => {
    try {
      const response = await fetch('http://68.183.86.1:8080/trackagile/site/get');
      const result = await response.json();

      if (result.status === 'OK' && result.data) {
        const parsedData = parseSiteData(result.data);
        setSites(parsedData);
      } else {
        console.error('Failed to fetch site data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching site data:', error);
    }
  };

  const parseSiteData = (data) => {
    return data
      .split('SiteInfoDto(')
      .slice(1)
      .map((site) => {
        const siteObj = {};
        site.split(', ').forEach((item) => {
          const [key, value] = item.split('=');
          siteObj[key] = value === 'null' ? '' : value;
        });
        return {
          siteName: siteObj.siteName || '',
          type: siteObj.subType || '',
          lgdCode: siteObj.lgdCode || '',
          mandal: siteObj.mandal || '',
          district: siteObj.district || '',
        };
      });
  };

  const handleSiteNameChange = (event) => {
    setSiteName(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleCreateSite = () => {
    setShowForm(true);
  };

  const handleFormSubmit = (newSiteData) => {
    setSites([newSiteData, ...sites]);
    setShowForm(false);
  };

  const handleExportToExcel = () => {
    console.log('Export to Excel clicked');
  };

  // Filter sites based on site name and type
  const filteredSites = sites.filter(site =>
    site.siteName.toLowerCase().includes(siteName.toLowerCase()) &&
    site.type.toLowerCase().includes(type.toLowerCase())
  );

  // Pagination
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentSites = filteredSites.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      {showForm ? (
        <div className="full-screen-form">
          <ManagerSitesForm onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />
        </div>
      ) : (
        <div className="sitesPage">
          <Row>
            <Col md={3}>
              <Form.Group controlId="siteName">
                <Form.Label>Site Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Site Name"
                  value={siteName}
                  onChange={handleSiteNameChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="type">
                <Form.Label>Type</Form.Label>
                <Form.Select value={type} onChange={handleTypeChange}>
                  <option value="">Select Type</option>
                  <option value="Type 1">Type 1</option>
                  <option value="Type 2">Type 2</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button variant="primary" onClick={handleCreateSite} className="create-employee-btnn">
                <FontAwesomeIcon icon={faPlus} /> Create Site
              </Button>
            </Col>
            <Col md={3}>
              <Button variant="secondary" onClick={handleExportToExcel} className="export-btn">
                <FontAwesomeIcon icon={faFileExcel} /> Export to Excel
              </Button>
            </Col>
          </Row>
          <br />

          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Site Name</th>
                <th>Type</th>
                <th>LGD Code</th>
                <th>Mandal</th>
                <th>District</th>
              </tr>
            </thead>
            <tbody>
              {currentSites.map((site, index) => (
                <tr key={index}>
                  <td>
                    <center>
                      <Button variant="link" className="view-icons">
                        <BiSolidPencil />
                      </Button>
                      &nbsp; &nbsp;
                      <Button variant="link" className="view-icons">
                        <FaEye
                          onClick={() => {
                            navigate('/site-view', { state: { site } });
                          }}
                        />
                      </Button>
                    </center>
                  </td>
                  <td>{site.siteName}</td>
                  <td>{site.type}</td>
                  <td>{site.lgdCode}</td>
                  <td>{site.mandal}</td>
                  <td>{site.district}</td>
                </tr>
              ))}
            </tbody>
          </Table>
              <div className='pagenation'>
              <Pagination className="justify-content-start">
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            />
            {Array.from({ length: Math.ceil(filteredSites.length / perPage) }).map((_, index) => (
              <Pagination.Item
                key={index}
                active={page === index + 1}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={endIndex >= filteredSites.length}
              onClick={() => handlePageChange(page + 1)}
            />
          </Pagination>
              </div>
        </div>
      )}
    </div>
  );
}

export default ManagerSiteMainPage;
