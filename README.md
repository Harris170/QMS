# IoT-Based Queue Management System

## Overview

This project aims to develop an **IoT-based queue management system**. Users can queue for services using their phone number as a unique identifier. The system will provide real-time updates such as estimated waiting times and arrival times at the establishment. The solution is implemented using **Rust**, with a focus on simplicity, reliability, and scalability.

## Documentation
Documentation to get started can be found [here](docs/GettingStarted.md)

### System Components

The establishment will receive a complete **package**, including the following components:

| **Component**                        | **Description**                                                                                                                                                      |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Admin Application**  | A cross-platform application (Windows, Linux, Mac) for **admins** to manage queues, staff, and view logs, graphs, and other trends. The admin interface is user-friendly and doesn't require access to the source code. |
| **Backend Server**     | The backend server, built with **Axum** (Rust framework), manages queues, staff, and all API communication. The server is pre-configured with an associated **config file** for each establishment. |
| **Frontend**        | A simple HTML, CSS, and JavaScript-based frontend, which can be replaced by a custom frontend developed by the establishment. Only **IT staff** or developers will handle frontend modifications. |
| **Firebase Database**                  | A database to store all queue, user, and staff data. |
| **IoT Kiosk Device**                  | A kiosk device with a touchscreen that allows users to input their phone number, validate their queue position, and print a token. The kiosk interfaces with the backend. |
| **Display and Speakers**              | A low-cost, low-power display and speaker system to show the current queue number and announce the next person in line. The number of devices is based on the number of queues. |

---

## Roles and Permissions

The system has two main roles: **Admins** and **Staff**.

### Admin
Admins have full control over the backend, frontend configuration, and overall system management. Admin responsibilities include:
- **Queue and Staff Management**: Admins assign queues to staff and manage which staff handle which queues.
- **Viewing Trends and Logs**: Admins can view trends, logs, and system statistics (e.g., average wait times, queue length).
- **Staff Management**: Admins create and remove staff members in the system.
- **Configuring Backend**: Admins configure the backend to define expected fields via a **config file** called **Backend.toml**.
- **Frontend Customization**: While a default frontend is provided, admins can use their own custom frontend to use **APIs** from the backend.

Admins will be able to use:
- A **backend binary** with an associated **configuration file** for setting up field data.
- The **admin app** (cross-platform).
- A **frontend** to test or replace with a custom frontend.

### Staff
Staff members operate at the counters and manage the queues through a simple desktop application interface. Responsibilities of staff include:
- **Updating the Queue**: Staff can update the backend by pressing "Next" to mark the current person as serviced and call the next person in the queue.
- **Viewing Queue Data**: Staff can view the current queue status and who is managing each queue through their **dedicated panel** within the admin app.

Staff will receive:
- The **admin app** that provides the interface to update the queue and view data.

---

## System Architecture

### 1. **Backend Server**
The backend server will be built using **Axum**, a **Rust-based web framework**, and will handle all queue management, staff assignments, and API interactions. It will handle the communication with all IoT devices and provide endpoints for the frontend to interact with the backend.

The backend will be compiled as a **binary** and pre-configured with a **config file**. This allows any establishment to interact with the system without requiring changes to the source code.

#### Backend Configuration

- The **backend config file** specifies the expected data fields from the frontend, ensuring proper communication between the backend and the custom or default frontend.
- The config file allows the **admins** to define the following fields:
  - **Queue data** (e.g., maximum queueing slots for each time slot, maximum queues etc)
  - **Form data** (e.g., name, phone numbers etc)

This configuration ensures that the backend can adapt to each establishment’s unique requirements.

---

### 2. **Frontend (Customizable)**
A simple **React webapp** will be provided by default for testing and internal use. Establishments will be able to:
- Replace the default frontend with a **custom frontend**.
- Develop the custom frontend using any frameworks or libraries of their choice, provided they adhere to the **API** specifications of the backend.

**IT teams** or **developers** within the establishment are responsible for maintaining the frontend. They can refer to the provided **API documentation** and backend configuration to ensure the frontend communicates correctly with the backend.

### 3. **Database (Firebase)**
Establishments can use any database to store the following data:
- Queue numbers
- User data (phone number as a unique ID)
- Staff assignments
- Statistics (e.g., number of people in the queue, average wait time)

Firebase is chosen for now.

### 4. **IoT Devices (Kiosk, Display, and Speakers)**
- **IoT Kiosk Device**: The kiosk is a simple **touchscreen device** that allows users to input their phone number to confirm their queue position. After input, it will print a **token**.
- **Number Display and Speakers**: These devices are connected to a **microcontroller** and display the current queue number while announcing the next person. The number of display and speaker pairs depends on the number of physical queues.

---
