import React, { useState } from 'react';
import { Form, Button, Table, Row, Col } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import '../Css/ManagerSitesForm.css';

const ManagerSitesForm = () => {
  const fields = [
    'Earth Pit', 'Bus Bar', 'UPS', 'Battery', 'Rack', 'Olt', 'Ont', 'Solar Panel',
    'AC Units', 'DG Set', 'Ambiance', 'Switch', 'EB Meters', 'Cables', 'FDMS Box', 'Router', 'Battery Stand', 'UPS Stand'
  ];

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '',
    mobileNumber: '',
    package: '',
    district: '',
    mandal: '',
  });

  const quantities = Array.from({ length: 12 }, (_, i) => i.toString());

  const [editIndex, setEditIndex] = useState(null);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact({ ...newContact, [name]: value });
  };

  const handleAddOrUpdateContact = () => {
    if (editIndex !== null) {
      const updatedContacts = [...contactInfo];
      updatedContacts[editIndex] = newContact;
      setContactInfo(updatedContacts);
      setEditIndex(null);
    } else {
      setContactInfo([newContact, ...contactInfo]);
    }
    setNewContact({
      name: '',
      mobileNumber: '',
      package: '',
      district: '',
      mandal: '',
    });
    setShowContactForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const siteData = {
        siteName: formData.get('siteName'),
        siteNum: formData.get('siteNum'),
        contactName: newContact.name,
        contactPhone: newContact.mobileNumber,
        district: newContact.district,
        mandal: newContact.mandal,
        packge: newContact.package,
        lgdCode: formData.get('lgdCode'),
        upsQty: parseInt(formData.get('UPSQty'), 10) || 0,
        batteryQty: parseInt(formData.get('BatteryQty'), 10) || 0,
        rackQty: parseInt(formData.get('RackQty'), 10) || 0,
        otlQty: parseInt(formData.get('OltQty'), 10) || 0,
        ontQty: parseInt(formData.get('OntQty'), 10) || 0,
        switchQty: parseInt(formData.get('SwitchQty'), 10) || 0,
        solarPanelQty: parseInt(formData.get('SolarPanelQty'), 10) || 0,
        earthPitQty: parseInt(formData.get('EarthPitQty'), 10) || 0,
        busBarQty: parseInt(formData.get('BusBarQty'), 10) || 0,
        acUnitsQty: parseInt(formData.get('ACUnitsQty'), 10) || 0,
        dgSetQty: parseInt(formData.get('DGSetQty'), 10) || 0,
        ambienceQty: parseInt(formData.get('AmbianceQty'), 10) || 0,
        ebMeterQty: parseInt(formData.get('EBMetersQty'), 10) || 0,
        routerQty: parseInt(formData.get('RouterQty'), 10) || 0,
        batteryStandQty: parseInt(formData.get('BatteryStandQty'), 10) || 0,
        upsStandQty: parseInt(formData.get('UPSStandQty'), 10) || 0,
        siteCOntactInfoDto: contactInfo.map(contact => ({
            name: contact.name,
            designation: contact.package, // Assuming package is used for designation
            phone: contact.mobileNumber
        }))
    };

    console.log('Site Data:', siteData); // Debugging line to check siteData

    fetch('http://68.183.86.1:8080/trackagile/site/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(siteData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Site saved successfully');
        e.target.reset();
        setContactInfo([]); // Clear contact info after saving
        setShowContactForm(false);
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to save site. Please try again.');
    });
};


  const handleCancel = () => {
    setNewContact({
      name: '',
      mobileNumber: '',
      package: '',
      district: '',
      mandal: '',
    });
    setContactInfo([]);
    setShowContactForm(false);
    document.querySelector('form').reset();
  };

  const handleCancel1 = () => {
    setNewContact({
      name: '',
      mobileNumber: '',
      package: '',
      district: '',
      mandal: '',
    });
    setShowContactForm(false);
  };

  const handleEdit = (index) => {
    const contactToEdit = contactInfo[index];
    setNewContact(contactToEdit);
    setEditIndex(index);
    setShowContactForm(true);
  };

  const handleDelete = (index) => {
    const updatedContacts = contactInfo.filter((_, i) => i !== index);
    setContactInfo(updatedContacts);
  };

  return (
    <div className='sites-page'>
      <div className="container mt-5">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group controlId="siteName" style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Label style={{ width: '30%' }}>Site Name <span className='chukkas'>*</span></Form.Label>
                <Form.Control type="text" name="siteName" placeholder="Enter site name" required style={{ width: '70%' }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="siteNum" style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Label style={{ width: '30%' }}>Site Number <span className='chukkas'>*</span></Form.Label>
                <Form.Control type="text" name="siteNum" placeholder="Enter site number" required style={{ width: '70%' }} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="lgdCode" style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Label style={{ width: '30%' }}>LGD Code <span className='chukkas'>*</span></Form.Label>
                <Form.Control type="text" name="lgdCode" required placeholder="Enter LGD Code" style={{ width: '70%' }} />
              </Form.Group>
            </Col>
          </Row>
          <br />
          <Row>
            {fields.map((field, index) => (
              <Col md={2} key={index}>
                <Form.Group className="custom-select">
                  <Form.Label>{field} Qty</Form.Label>
                  <Form.Control as="select" name={`${field.replace(' ', '')}Qty`} defaultValue="0">
                    {quantities.map((qty) => (
                      <option key={qty} value={qty}>{qty}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            ))}
          </Row>
          <br />
          <div className='contactInformation'><center><h5>Contact Information</h5></center></div>
          <br />
          <div>
            <Button variant="primary" onClick={() => setShowContactForm(true)}>
              Add Contact <Plus />
            </Button>

            {showContactForm && (
              <div>
                <Row className="mt-3">
                  <Col>
                    <Form.Group controlId="contactName">
                      <Form.Label>Name <span className='chukkas'>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={newContact.name}
                        onChange={handleContactChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="contactMobileNumber">
                      <Form.Label>Mobile Number <span className='chukkas'>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="mobileNumber"
                        value={newContact.mobileNumber}
                        onChange={handleContactChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="contactPackage">
                      <Form.Label>Package</Form.Label>
                      <Form.Control
                        type="text"
                        name="package"
                        value={newContact.package}
                        onChange={handleContactChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Form.Group controlId="contactDistrict">
                      <Form.Label>District <span className='chukkas'>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="district"
                        value={newContact.district}
                        onChange={handleContactChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="contactMandal">
                      <Form.Label>Mandal <span className='chukkas'>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="mandal"
                        value={newContact.mandal}
                        onChange={handleContactChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Button variant="success" onClick={handleAddOrUpdateContact}>
                      {editIndex !== null ? 'Update' : 'Add'}
                    </Button> &nbsp;
                    <Button variant="secondary" onClick={handleCancel1}>
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
          </div>
          <br />
          <Table striped bordered  className='sitesContactFormTable' >
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Package</th>
                <th>District</th>
                <th>Mandal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contactInfo.map((contact, index) => (
                <tr key={index}>
                  <td>{contact.name}</td>
                  <td>{contact.mobileNumber}</td>
                  <td>{contact.package}</td>
                  <td>{contact.district}</td>
                  <td>{contact.mandal}</td>
                  <td>
                    <Button variant="warning" onClick={() => handleEdit(index)}>Edit</Button>{' '}
                    <Button variant="danger" onClick={() => handleDelete(index)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <br />
          <center>
          <Button variant="success" type="submit">
            Save
          </Button> &nbsp;
          <Button variant="secondary" onClick={handleCancel} className="ml-2">
            Cancel
          </Button>
          </center>
        </Form>
      </div>
    </div>
  );
};

export default ManagerSitesForm;
