# 1. Database technical solution

1. Users table (users): Store employee and administrator information
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id VARCHAR(5) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('employee', 'admin'))
);
```

2. Gift box applications table (applications)
```sql
CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id VARCHAR(5) NOT NULL,
  box_type VARCHAR(10) NOT NULL CHECK (box_type IN ('regular', 'halal')),
  delivery_type VARCHAR(10) NOT NULL CHECK (delivery_type IN ('offline', 'online')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  address VARCHAR(100),
  tracking_number VARCHAR(50),
  courier_company VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(employee_id)
);
```

Initial Data:
```sql
-- Create admin user
INSERT INTO users (employee_id, password, role) VALUES ('admin', 'admin123', 'admin');

-- Create employee users (e0001-e0010)
INSERT INTO users (employee_id, password, role)
SELECT 'e000' || i, 'password' || i, 'employee'
FROM (SELECT 1 AS i UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10);
```

# 2. Interface technology solution

1. Login Interface
```yaml
paths:
  /api/auth/login:
    post:
      summary: "User login"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                employee_id:
                  type: string
                  example: "e0001"
                password:
                  type: string
                  example: "password1"
      responses:
        '200':
          description: "Login successful"
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  msg:
                    type: string
                  data:
                    type: object
                    properties:
                      employee_id:
                        type: string
                      role:
                        type: string
                      token:
                        type: string
```

2. Gift Box Application Interface
```yaml
paths:
  /api/applications:
    post:
      summary: "Submit gift box application"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                box_type:
                  type: string
                  enum: ["regular", "halal"]
                delivery_type:
                  type: string
                  enum: ["offline", "online"]
                address:
                  type: string
      responses:
        '200':
          description: "Application submitted successfully"
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  msg:
                    type: string
                  data:
                    type: object
                    properties:
                      application_id:
                        type: integer
```

3. Application Status Query Interface
```yaml
paths:
  /api/applications/status:
    get:
      summary: "Get application status"
      responses:
        '200':
          description: "Application status retrieved"
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  msg:
                    type: string
                  data:
                    type: object
                    properties:
                      status:
                        type: string
                      box_type:
                        type: string
                      delivery_type:
                        type: string
                      tracking_number:
                        type: string
                      courier_company:
                        type: string
```

4. Admin Application List Interface
```yaml
paths:
  /api/admin/applications:
    get:
      summary: "Get all applications"
      responses:
        '200':
          description: "Applications retrieved successfully"
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                  msg:
                    type: string
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: integer
                        employee_id:
                          type: string
                        box_type:
                          type: string
                        delivery_type:
                          type: string
                        status:
                          type: string
```

# 3. Page technology solution

1. Login Page (/pages/login.js)
- Dependent interface: POST /api/auth/login
- Functional description:
```
@startuml
(*) --> "Display Login Form"
--> "User enters credentials"
--> "Validate input format"
if "Valid format?" then
  -->[yes] "Call login API"
  if "Login successful?" then
    -->[yes] "Store token"
    --> "Redirect based on role"
  else
    -->[no] "Show error message"
    --> "Display Login Form"
  endif
else
  -->[no] "Show format error"
  --> "Display Login Form"
endif
@enduml
```

2. Application Page (/pages/application.js)
- Dependent interface: POST /api/applications
- Functional description:
```
@startuml
(*) --> "Display Application Form"
--> "User selects box type"
--> "User selects delivery method"
if "Online delivery?" then
  -->[yes] "Show address form"
  --> "Validate address"
else
  -->[no] "Skip address form"
endif
--> "Submit application"
if "Submission successful?" then
  -->[yes] "Show success message"
  --> "Redirect to status page"
else
  -->[no] "Show error message"
  --> "Display Application Form"
endif
@enduml
```

3. Status Page (/pages/status.js)
- Dependent interface: GET /api/applications/status
- Functional description:
```
@startuml
(*) --> "Load status page"
--> "Fetch application status"
if "Has application?" then
  -->[yes] "Display application details"
  if "Online delivery?" then
    -->[yes] "Show tracking info"
  else
    -->[no] "Show pickup info"
  endif
else
  -->[no] "Show no application message"
endif
@enduml
```

4. Admin Dashboard Page (/pages/admin/dashboard.js)
- Dependent interface: GET /api/admin/applications
- Functional description:
```
@startuml
(*) --> "Load admin dashboard"
--> "Fetch all applications"
--> "Display applications list"
--> "Admin selects application"
if "Online delivery?" then
  -->[yes] "Show tracking input form"
  --> "Update tracking info"
else
  -->[no] "Show offline pickup status"
endif
@enduml
```