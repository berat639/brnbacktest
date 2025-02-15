import React, { useState, useEffect, Fragment } from "react";
import { auth } from '@strapi/helper-plugin';

import Modal from "react-modal"; // Modal component for displaying rich text editor
import pluginId from "../../pluginId";
 import CustomCKEditor from "../../components/CustomCkEditor";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Box,
  Typography,
  BaseCheckbox,
  Flex,
  Button,
  ModalLayout,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@strapi/design-system";

const HomePage = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [subscribers, setSubscribers] = useState([]); // Already initialized as empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState("");

  const fetchImageUrl = async (imageId) => {
    const response = await fetch(`http://localhost:1337/api/upload/files/${imageId}`);
    const image = await response.json();
    return image.url;
  };
  
  

  const renderEmailTemplate = (content, recipientName) => {
    const headerImageUrl = fetchImageUrl("129"); // Görsel dosya adını buraya yazın
  
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background-color: #000138;
            padding: 10px 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .email-header img {
            max-width: 100%; /* Görselin konteyner boyutunu aşmasını engeller */
            height: auto;
          }
          .email-body {
            padding: 20px;
            font-size: 16px;
            color: #333333;
          }
          .email-footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="${headerImageUrl}" alt="Header Image" />
          </div>
          <div class="email-body">
            <p>Merhaba, ${recipientName || "Değerli Kullanıcı"}!</p>
            <p>${content}</p>
          </div>
          <div class="email-footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  

  const sendBulkEmail = async () => {
    console.log("Sending emails to:", selectedUsers);
  
    try {
      for (const email of selectedUsers) {
        const renderedHtml = renderEmailTemplate(emailContent, email);
  
        const response = await fetch("/api/email/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            subject: "Özel Şablonlu E-posta",
            html: renderedHtml,
          }),
        });
  
        if (!response.ok) {
          console.error(`E-posta gönderimi başarısız oldu: ${email}`);
        }
      }
  
      alert("Toplu e-postalar başarıyla gönderildi!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Toplu e-posta gönderimi sırasında bir hata oluştu:", error);
      alert("Toplu e-posta gönderimi başarısız oldu.");
    }
  };
  

  const fetchSubscribers = async (page = 1) => {
    try {
      const token = auth.getToken();
      
      const response = await fetch(
        `http://localhost:1337/content-manager/collection-types/api::subscriber.subscriber?page=${page}&pageSize=${pageSize}&sort=id:ASC`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch subscribers:', response.status);
        return;
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result && result.results) {
        setSubscribers(result.results.map(item => ({
          id: item.id,
          attributes: {
            email: item.email,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }
        })));
        setTotalPages(Math.ceil(result.pagination.total / pageSize));
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setSubscribers([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    console.log('Fetching subscribers for page:', currentPage); // Debug log
    fetchSubscribers(currentPage);
  }, [currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckboxChange = (email) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(email)
        ? prevSelected.filter((userEmail) => userEmail !== email)
        : [...prevSelected, email]
    );
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box padding={4} background="neutral100">
      <Typography variant="alpha" fontWeight="bold">
        {pluginId}
      </Typography>

      <Box padding={4} background="neutral0" shadow="filterShadow">
        <Table 
          colCount={5} 
          rowCount={subscribers?.length || 0} 
          footer={undefined}
        >
          <Thead>
            <Tr>
              <Th action={undefined}>
                <BaseCheckbox
                  aria-label="Select all entries"
                  onChange={(e) => {
                    if (!subscribers) return;
                    const allEmails = subscribers.map(
                      (subscriber) => subscriber.attributes.email
                    );
                    setSelectedUsers(e.target.checked ? allEmails : []);
                  }}
                  checked={subscribers?.length > 0 && selectedUsers.length === subscribers.length}
                />
              </Th>
              <Th action={undefined}>
                <Typography variant="sigma">ID</Typography>
              </Th>
              <Th action={undefined}>
                <Typography variant="sigma">Email</Typography>
              </Th>
              <Th action={undefined}>
                <Typography variant="sigma">Created At</Typography>
              </Th>
              <Th action={undefined}>
                <Typography variant="sigma">Updated At</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.isArray(subscribers) && subscribers.map((subscriber) => (
              <Tr key={subscriber.id}>
                <Td>
                  <BaseCheckbox
                    aria-label={`Select ${subscriber.attributes.email}`}
                    checked={selectedUsers.includes(subscriber.attributes.email)}
                    onChange={() =>
                      handleCheckboxChange(subscriber.attributes.email)
                    }
                  />
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {subscriber.id}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {subscriber.attributes.email}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {new Date(subscriber.attributes.createdAt).toLocaleString()}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {new Date(subscriber.attributes.updatedAt).toLocaleString()}
                  </Typography>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Flex justifyContent="flex-end" paddingTop={4}>
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="secondary"
            marginRight={2}
          >
            Previous
          </Button>
          <Typography paddingRight={2} paddingLeft={2}>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="secondary"
          >
            Next
          </Button>
        </Flex>

        <Box paddingTop={4}>
          <Button onClick={openModal} variant="default">
            Send Bulk Email
          </Button>
        </Box> 
        {isModalOpen && (
          <ModalLayout onClose={closeModal} labelledBy="title">
            <ModalHeader>
              <Typography fontWeight="bold" variant="beta" id="title">
                Edit Email Content
              </Typography>
            </ModalHeader>
            <ModalBody>
              <Box paddingBottom={4}>
                <CustomCKEditor
                  onChange={({ target: { value } }) => {
                    setEmailContent(value);
                  }}
                  name={"email"}
                  value={emailContent}
                />
              </Box>
            </ModalBody>
            <ModalFooter
              startActions={
                <Button onClick={closeModal} variant="tertiary">
                  Cancel
                </Button>
              }
              endActions={
                <Button onClick={sendBulkEmail} variant="success-light">
                  Send Email
                </Button>
              }
            />
          </ModalLayout>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
