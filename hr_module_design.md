# Human Resource Module Design

## Overview
Consolidate Users and Team modules into a comprehensive HR management system following industry best practices.

## Core Components

### 1. Employee Management
- **Employee Profiles**: Complete employee information (personal, contact, emergency contacts)
- **Employment Details**: Job title, department, position, employment type, join date, contract details
- **Document Management**: Store employee documents (contracts, certificates, ID copies)
- **Organizational Hierarchy**: Reporting structure, manager assignments

### 2. Attendance & Time Tracking
- **Daily Attendance**: Clock in/out, work hours tracking
- **Attendance Reports**: Daily, weekly, monthly attendance summaries
- **Late/Early Tracking**: Monitor punctuality
- **Overtime Management**: Track and approve overtime hours
- **Work From Home**: Remote work tracking

### 3. Leave Management
- **Leave Types**: Annual leave, sick leave, casual leave, maternity/paternity leave
- **Leave Balance**: Track available and used leave days
- **Leave Requests**: Submit, approve/reject workflow
- **Leave Calendar**: Visual calendar showing team availability
- **Leave Policies**: Configurable leave rules per employee type

### 4. Performance Management
- **Performance Reviews**: Periodic evaluations (quarterly, annual)
- **Goal Setting**: Individual and team goals with progress tracking
- **360-Degree Feedback**: Multi-rater feedback system
- **Performance Ratings**: Standardized rating scales
- **Performance Improvement Plans (PIP)**: Track underperformance and improvement

### 5. KPI Tracking
- **Individual KPIs**: Employee-specific performance metrics
- **Department KPIs**: Team-level performance indicators
- **KPI Dashboard**: Visual representation of performance metrics
- **KPI Targets**: Set and track target vs actual performance
- **Trend Analysis**: Historical KPI performance trends

### 6. Payroll Integration (Future)
- **Salary Information**: Basic salary, allowances, deductions
- **Payslip Generation**: Monthly payslip creation
- **Tax Calculations**: Automated tax deductions
- **Bank Details**: Employee banking information

### 7. Training & Development
- **Training Programs**: Track employee training and certifications
- **Skill Matrix**: Employee skills and competencies
- **Training Requests**: Submit and approve training needs
- **Training Calendar**: Scheduled training sessions

### 8. Employee Self-Service
- **Profile Updates**: Employees can update personal information
- **Leave Applications**: Self-service leave requests
- **Attendance View**: View own attendance records
- **Payslip Access**: Download payslips
- **Document Access**: View employment documents

## Database Schema

### employees (extends users table)
- id, user_id (FK), employee_code, department, position, job_title
- employment_type, join_date, contract_end_date, manager_id
- salary_grade, work_location, work_schedule
- emergency_contact_name, emergency_contact_phone
- status (active, on_leave, terminated)

### departments
- id, name, description, head_id (FK to employees), created_at

### positions
- id, title, department_id, level, description, created_at

### attendance_records
- id, employee_id, date, clock_in, clock_out, work_hours
- status (present, absent, late, half_day, wfh), notes

### leave_balances
- id, employee_id, leave_type, total_days, used_days, available_days, year

### leave_applications
- id, employee_id, leave_type, start_date, end_date, days_count
- reason, status (pending, approved, rejected), approved_by, approved_at

### performance_reviews
- id, employee_id, reviewer_id, review_period, review_date
- overall_rating, strengths, areas_for_improvement, goals, comments

### employee_kpis
- id, employee_id, kpi_name, kpi_description, target_value, actual_value
- measurement_unit, period (monthly, quarterly, annual), status

### training_records
- id, employee_id, training_name, training_type, start_date, end_date
- status (scheduled, completed, cancelled), certificate_url

## UI Structure

### HR Dashboard
- Employee headcount by department
- Attendance summary (present, absent, on leave)
- Leave requests pending approval
- Upcoming performance reviews
- Department-wise KPI overview
- Recent hires and departures

### Employee Directory
- Searchable employee list with filters
- Grid/List view with photos
- Quick contact information
- Organizational chart view

### My Team (for Managers)
- Team member list
- Team attendance overview
- Pending leave approvals
- Team performance metrics

### Employee Profile Page
- Personal information tab
- Employment details tab
- Attendance & Leave tab
- Performance & KPIs tab
- Training & Development tab
- Documents tab

## KPI Framework

### Sales Team KPIs
- Monthly revenue target achievement (%)
- Number of new customers acquired
- Customer retention rate (%)
- Average deal size
- Sales cycle length (days)

### Project Team KPIs
- Project completion rate (%)
- On-time delivery rate (%)
- Budget adherence (%)
- Customer satisfaction score
- Project profitability margin (%)

### Operations Team KPIs
- Process efficiency rate (%)
- Error/Defect rate (%)
- Cost reduction achieved (%)
- Vendor performance score
- Inventory turnover ratio

### Individual KPIs
- Task completion rate (%)
- Quality of work score
- Attendance rate (%)
- Training completion rate (%)
- Peer feedback score

## Implementation Priority

### Phase 1 (MVP)
1. Employee profiles with basic information
2. Department and position management
3. Attendance tracking
4. Leave management with approval workflow
5. Basic employee directory

### Phase 2
1. Performance review system
2. Individual KPI tracking
3. HR dashboard with analytics
4. Organizational chart
5. Employee self-service portal

### Phase 3
1. Training management
2. Document management
3. Advanced reporting
4. Payroll integration
5. Mobile app support

## Navigation Structure
Replace "Users" and "Team" with single "Human Resource" menu item with sub-sections:
- HR Dashboard
- Employee Directory
- Attendance
- Leave Management
- Performance & KPIs
- Training
- Reports
