# **Project Requirements Document: SENTINEL – Contract Management System**

The following document outlines the detailed project requirements and description of the SENTINEL contract management system developed for Global Mobility Service Inc.

---

## 📝 Project Summary

SENTINEL is a centralized contract management system that streamlines contract creation, review, approval, storage, and renewal. It reduces risks related to manual handling, missed deadlines, and compliance failures.

---

## 👥 Stakeholders & User Roles

| Role             | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| Employee         | Submits contract requests, uploads documents, views status                  |
| Department Head  | Reviews and approves initial contract submissions                           |
| Legal Team       | Performs legal review, updates, disapprovals, and manages contract records  |
| CEO              | Provides final approval on contracts                                        |
| IT Department    | Manages system operations and user accounts                                 |

---

## 💡 Problems Addressed

| Problem                             | Solution                                                                 |
|-------------------------------------|--------------------------------------------------------------------------|
| Missed contract deadlines           | Automated notifications and reminders                                    |
| Scattered documentation             | Centralized repository for contracts                                     |
| Manual approval bottlenecks         | Multi-level workflow routing with role-based access                      |
| Lack of compliance and audit trails | Complete version tracking and access logging                             |

---

## 🎯 Functional Requirements

| Requirement ID | Description                             | User Story                                                                 | Expected Behavior/Outcome                                                                                       |
|----------------|-----------------------------------------|----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| FR001          | Login & Authentication                  | As a user, I want to securely log in to access my features.               | The system authenticates users and provides role-based access.                                                  |
| FR002          | Contract Request Submission             | As an employee, I want to submit a contract with details and documents.   | Employees fill in a form and upload necessary files.                                                            |
| FR003          | Approval Workflow                       | As a manager or legal, I want to approve or disapprove contracts.         | Contracts are routed to appropriate roles based on a predefined flow.                                           |
| FR004          | Contract Review and Editing             | As legal, I want to review and edit contracts before final approval.      | Legal team can comment, edit, or request changes.                                                               |
| FR005          | CEO Final Approval                      | As a CEO, I want to give final sign-off on important contracts.           | Once approved by legal, the contract is forwarded to CEO for final decision.                                    |
| FR006          | Notifications and Alerts                | As a user, I want to be notified of contract deadlines and changes.       | The system sends real-time alerts via email or dashboard.                                                       |
| FR007          | Contract Inventory                      | As legal or IT, I want to view all contract data in one place.            | A dashboard lists all contracts with search and filter capabilities.                                            |
| FR008          | Audit Logs                              | As an admin, I want to trace all actions done on a contract.              | The system logs every update, review, and approval with timestamps.                                             |
| FR009          | User Account Management                 | As IT, I want to manage and assign roles to users.                        | IT can create, deactivate, or edit user roles from an admin panel.                                              |

---

## 🗃️ Database Overview (Based on Pocketbase Schema)

     | 
## 📐 Technical Stack

| Layer        | Technology                            |
|--------------|----------------------------------------|
| Frontend     | Angular, Tailwind CSS, Daisy UI        |
| Backend      | Postgresql                            |
| Hosting      | Postgresql, Angular CLI                |
| Versioning   | GitHub                                 |

---

## 🔧 Development Approach

| Phase                     | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| Requirements Gathering    | Client interviews, observation, document reviews                           |
| UI/UX Design              | Low-fidelity wireframes, user workflows                                    |
| Agile Development         | Modular iterations using sprints                                           |
| Testing                   | UAT, functional, security, and E2E testing                                 |
| Deployment                | Production hosting, bug fixing, and client feedback                        |

---

## ⚠️ Limitations

| Limitation                            | Description                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| User Training Needed                 | Users may need guidance using multi-step approval flows                    |
| Integration with Existing Systems    | May require future APIs or data migration                                  |
| Manual Data Uploads                  | No OCR or automated scanning of contracts yet                              |
| Legal Interpretations                | System depends on correct manual legal input                               |

---

## 🗂 Repository Structure Overview

The frontend of SENTINEL is structured modularly for maintainability and clear separation of concerns. Below is a conceptual breakdown of the `/src` folder:

