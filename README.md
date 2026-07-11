# Weekly Report Generator & Management Analytics Dashboard

Full Stack Weekly Report Generator built**Django REST Framework (DRF)** backend API, an interactive **React.js (Vite + Tailwind CSS)** management UI dashboard utilizing **Chart.js** visuals, a **MySQL** relational data layer, and an integrated **Gemini AI RAG Co-Pilot** layout panel.
---

## 🛠️ Global Project Architecture

```text
weekly-report-generator/     <--- Absolute Workspace Root
├── backend/                  <--- Django API Service Gateway
│   ├── .env                  <--- Private Backend Key Variables
│   ├── manage.py
│   └── requirements.txt
├── frontend/                 <--- React Client Application Core
│   ├── .env                  <--- Client API Endpoint Config
│   ├── package.json
│   └── src/
└── README.md                 <--- Global Orchestration Guide (This File)
---

## 🚀 Step-by-Step Local Deployment Setup

### 1) Relational Database Provisioning (MySQL)

Before starting the backend application, prepare your MySQL data layer:

1. Ensure **MySQL Server** is active and listening on port `3306`.
2. Open your database console client (MySQL Workbench, terminal CLI, or phpMyAdmin) and create your application schema database:
```sql
CREATE DATABASE weekly_report_db;

```
3. Establish an administrative user profile configuration to manage the schema:
```sql
CREATE USER 'report_admin'@'localhost' IDENTIFIED BY 'YourSecurePasswordHere';
GRANT ALL PRIVILEGES ON weekly_report_db.* TO 'report_admin'@'localhost';
FLUSH PRIVILEGES;

```

### 2) Running the Backend Service Layer (Django)

The backend layer handles user authentications, model constraints validation, and intelligence generation hooks.

1. Navigate to the `backend` path from your project root:
```bash
cd backend

```

2. Spin up a clean Python isolated virtual environment container:
```bash
# On Windows:
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

```


3. Install the application pipeline packages:
```bash
pip install -r requirements.txt

```

*(Note: This downloads packages including `django-environ`, `django-cors-headers`, `djangorestframework-simplejwt`, and your database driver.)*
4. Create a file named exactly **`.env`** directly inside the `backend/` root directory to map your credentials safely:
```env
# 🔑 System Security & Debug Mode
SECRET_KEY=django-insecure-hf*^@2n20hrtwsvuu_a8+3_we^fe78ofno$kr_v7rv_r+t+tt#
DEBUG=True

# 🗄️ MySQL Relational Database Access Link Parameters
DB_NAME=weekly_report_db
DB_USER=root
DB_PASSWORD=YourPassword
DB_HOST=localhost
DB_PORT=3306

# 🧠 Google Gemini Generative AI Engine Integration Config
GEMINI_API_KEY=AIzaSyYour_Actual_Gemini_API_Key_Token_Goes_Here

```

5. Run database migrations to scaffold the schemas:
```bash
python manage.py makemigrations
python manage.py migrate

```

6. 👤 **Provision your Administrative Access Credential:**
Create your Django superuser account. This credential is used to access **both** the backend Django admin panel and log straight into your React Admin Management Dashboard layout:
```bash
python manage.py createsuperuser

```

*Follow the on-screen terminal prompts to define your secure admin username, email, and password.*
7. Fire up your active backend development gateway server:
```bash
python manage.py runserver

```
*The system backend initializes cleanly on **`http://127.0.0.1:8000/*`**

---
### 3) Running the Frontend Workspace Client (React + Vite)

The presentation interface parses raw telemetry streams and hooks them to active Tailwind UI styles and chart widgets.

1. Open a separate terminal path and shift focus into the `frontend` container directory:
```bash
cd frontend

```
2. Download and synchronize the node application module libraries:
```bash
npm install

```
*(Note: This downloads dependencies including `chart.js`, `react-chartjs-2`, `lucide-react`, and `react-hot-toast`.)*
3. Create an environmental target config profile by adding a **`.env`** file to your `frontend/` folder root:
```env
VITE_API_URL=[http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

```
4. Spin up your local hot-reloaded development tracking compilation client:
```bash
npm run dev

```
*The client workspace application will launch on **`http://localhost:5173/*`**

---

## 🔑 Accessing the Management Dashboard

Once both servers are running seamlessly:

1. Open your browser and navigate to the frontend interface client: `http://localhost:5173/login`
2. **To log into the Admin / Manager Dashboard view:** Use the exact **Django Superuser** username and password combinations you created during step 2.6.
3. Once authenticated, the application state router will grant your account access permissions, load the management metrics layout feed, and populate your tracking charts automatically!
---
## 🔒 Production Security Guardrails Reminder

Always verify that your local context credentials remain locked down out of global version control systems:

* Ensure your global `.gitignore` includes explicit lines blocking environment overrides:
```text
.env
backend/.env
frontend/.env
__pycache__/
node_modules/
venv/
