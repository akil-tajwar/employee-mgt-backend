import { relations, sql } from 'drizzle-orm'
import {
  sqliteTable,
  integer,
  text,
  check,
  real,
} from 'drizzle-orm/sqlite-core'

// ========================
// Roles & Permissions
// ========================
export const roleModel = sqliteTable('roles', {
  roleId: integer('role_id').primaryKey(),
  roleName: text('role_name').notNull(),
})

export const userModel = sqliteTable('users', {
  userId: integer('user_id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  active: integer('active').notNull().default(1),
  roleId: integer('role_id').references(() => roleModel.roleId, {
    onDelete: 'set null',
  }),
  isPasswordResetRequired: integer('is_password_reset_required').default(1),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedAt: integer('updated_at'),
})

export const permissionsModel = sqliteTable('permissions', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
})

export const rolePermissionsModel = sqliteTable('role_permissions', {
  roleId: integer('role_id').references(() => roleModel.roleId),
  permissionId: integer('permission_id')
    .notNull()
    .references(() => permissionsModel.id),
})

export const userRolesModel = sqliteTable('user_roles', {
  userId: integer('user_id')
    .notNull()
    .references(() => userModel.userId),
  roleId: integer('role_id')
    .notNull()
    .references(() => roleModel.roleId),
})

// ========================
// Business Tables
// ========================
export const departmentModel = sqliteTable('departments', {
  departmentId: integer('department_id').primaryKey({ autoIncrement: true }),
  departmentName: text('department_name').notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at'),
})

export const designationModel = sqliteTable('designations', {
  designationId: integer('designation_id').primaryKey({ autoIncrement: true }),
  designationName: text('designation_name').notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at'),
})

export const employeeTypeModel = sqliteTable('employee_types', {
  employeeTypeId: integer('employee_type_id').primaryKey({
    autoIncrement: true,
  }),
  employeeTypeName: text('employee_type_name').notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at'),
})

export const employeeModel = sqliteTable(
  'employees',
  {
    employeeId: integer('employee_id').primaryKey({ autoIncrement: true }),
    fullName: text('full_name').notNull(),
    email: text('email').notNull().unique(),
    officialPhone: text('official_phone').notNull().unique(),
    personalPhone: text('personal_phone'),
    presentAddress: text('present_address').notNull(),
    permanentAddress: text('permanent_address'),
    emergencyContactName: text('emergency_contact_name'),
    emergencyContactPhone: text('emergency_contact_phone'),
    photoUrl: text('photo_url'),
    cvUrl: text('cv_url'),
    dob: text('dob').notNull(),
    doj: text('doj').notNull(),
    gender: text('gender').notNull(),
    bloodGroup: text('blood_group'),
    basicSalary: real('basic_salary'),
    grossSalary: real('gross_salary').notNull(),
    isActive: integer('is_active').notNull().default(1),
    empCode: text('emp_code').notNull().unique(),
    departmentId: integer('department_id')
      .references(() => departmentModel.departmentId)
      .notNull(),
    designationId: integer('designation_id')
      .references(() => designationModel.designationId)
      .notNull(),
    employeeTypeId: integer('employee_type_id')
      .references(() => employeeTypeModel.employeeTypeId)
      .notNull(),
    officeTimingId: integer('office_timing_id')
      .references(() => officeTimingModel.officeTimingId)
      .notNull(),
    createdBy: integer('created_by').notNull(),
    createdAt: integer('created_at').default(sql`(unixepoch())`),
    updatedBy: integer('updated_by'),
    updatedAt: integer('updated_at'),
  },
  (table) => ({
    genderCheck: check(
      'gender_check',
      sql`${table.gender} in ('Male', 'Female')`
    ),
    bloodGroupCheck: check(
      'blood_group_check',
      sql`${table.bloodGroup} in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')`
    ),
  })
)

export const weekendModel = sqliteTable(
  'weekends',
  {
    weekendId: integer('weekend_id').primaryKey({ autoIncrement: true }),
    day: text('day').notNull(),
  },
  (table) => ({
    dayCheck: check(
      'weekend_check',
      sql`${table.day} in ('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')`
    ),
  })
)

export const officeTimingModel = sqliteTable('office_timing', {
  officeTimingId: integer('office_timing_id').primaryKey({
    autoIncrement: true,
  }),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at'),
})

export const officeTimingWeekendsModel = sqliteTable('office_timing_weekends', {
  officeTimingWeekendId: integer('office_timing_weekend_id').primaryKey({
    autoIncrement: true,
  }),
  officeTimingId: integer('office_timing_id')
    .notNull()
    .references(() => officeTimingModel.officeTimingId, {
      onDelete: 'cascade',
    }),
  weekendId: integer('weekend_id')
    .notNull()
    .references(() => weekendModel.weekendId, { onDelete: 'cascade' }),
  createdBy: integer('created_by').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at'),
})

export const holidayModel = sqliteTable('holidays', {
  holidayId: integer('holiday_id').primaryKey({ autoIncrement: true }),
  holidayName: text('holiday_name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  noOfDays: integer('no_of_days').notNull(),
  description: text('description'),
  createdBy: integer('created_by').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at'),
})

export const leaveTypeModel = sqliteTable('leave_types', {
  leaveTypeId: integer('leave_type_id').primaryKey({ autoIncrement: true }),
  leaveTypeName: text('leave_type_name').notNull(),
  totalLeaves: integer('total_leaves').notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at'),
})

//to track which leave types are assigned to which employees
export const employeeLeaveTypeModel = sqliteTable('employee_leave_types', {
  employeeLeaveTypeId: integer('employee_leave_type_id').primaryKey({
    autoIncrement: true,
  }),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employeeModel.employeeId, { onDelete: 'cascade' }),

  leaveTypeId: integer('leave_type_id')
    .notNull()
    .references(() => leaveTypeModel.leaveTypeId, { onDelete: 'cascade' }),
})

// to track leaves taken by employees
export const employeeLeaveModel = sqliteTable('employee_leaves', {
  employeeLeaveId: integer('employee_leave_id').primaryKey({
    autoIncrement: true,
  }),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employeeModel.employeeId, { onDelete: 'cascade' }),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  noOfDays: integer('no_of_days').notNull(),
  leaveTypeId: integer('leave_type_id')
    .notNull()
    .references(() => leaveTypeModel.leaveTypeId, {
      onDelete: 'cascade',
    }),
  description: text('description'),
  createdBy: integer('created_by').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at'),
})

export const employeeAttendanceModel = sqliteTable('employee_attendances', {
  employeeAttendanceId: integer('employee_attendance_id').primaryKey({
    autoIncrement: true,
  }),
  employeeId: integer('employee_id')
    .notNull()
    .references(() => employeeModel.employeeId, { onDelete: 'cascade' }),
  attendanceDate: text('attendance_date').notNull(),
  inTime: text('in_time').notNull(),
  outTime: text('out_time').notNull(),
  lateInMinutes: integer('late_in_minutes').notNull().default(0),
  earlyOutMinutes: integer('early_out_minutes').notNull().default(0),
  createdBy: integer('created_by').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at'),
})

// ========================
// Relations
// ========================
export const userRelations = relations(userModel, ({ one }) => ({
  role: one(roleModel, {
    fields: [userModel.roleId],
    references: [roleModel.roleId],
  }),
}))

export const roleRelations = relations(roleModel, ({ many }) => ({
  rolePermissions: many(rolePermissionsModel),
}))

export const rolePermissionsRelations = relations(
  rolePermissionsModel,
  ({ one }) => ({
    role: one(roleModel, {
      fields: [rolePermissionsModel.roleId],
      references: [roleModel.roleId],
    }),
    permission: one(permissionsModel, {
      fields: [rolePermissionsModel.permissionId],
      references: [permissionsModel.id],
    }),
  })
)

export const userRolesRelations = relations(userRolesModel, ({ one }) => ({
  user: one(userModel, {
    fields: [userRolesModel.userId],
    references: [userModel.userId],
  }),
  role: one(roleModel, {
    fields: [userRolesModel.roleId],
    references: [roleModel.roleId],
  }),
}))

export const employeeRelations = relations(employeeModel, ({ one }) => ({
  department: one(departmentModel, {
    fields: [employeeModel.departmentId],
    references: [departmentModel.departmentId],
  }),
  designation: one(designationModel, {
    fields: [employeeModel.designationId],
    references: [designationModel.designationId],
  }),
  employeeType: one(employeeTypeModel, {
    fields: [employeeModel.employeeTypeId],
    references: [employeeTypeModel.employeeTypeId],
  }),
}))

export const officeTimingWeekendRelations = relations(
  officeTimingWeekendsModel,
  ({ one }) => ({
    officeTiming: one(officeTimingModel, {
      fields: [officeTimingWeekendsModel.officeTimingId],
      references: [officeTimingModel.officeTimingId],
    }),
    weekend: one(weekendModel, {
      fields: [officeTimingWeekendsModel.weekendId],
      references: [weekendModel.weekendId],
    }),
  })
)

export const employeeLeaveTypeRelations = relations(
  employeeLeaveTypeModel,
  ({ one }) => ({
    employee: one(employeeModel, {
      fields: [employeeLeaveTypeModel.employeeId],
      references: [employeeModel.employeeId],
    }),
    leaveType: one(leaveTypeModel, {
      fields: [employeeLeaveTypeModel.leaveTypeId],
      references: [leaveTypeModel.leaveTypeId],
    }),
  })
)

export const employeeLeaveRelations = relations(
  employeeLeaveModel,
  ({ one }) => ({
    employee: one(employeeModel, {
      fields: [employeeLeaveModel.employeeId],
      references: [employeeModel.employeeId],
    }),
    leaveType: one(leaveTypeModel, {
      fields: [employeeLeaveModel.leaveTypeId],
      references: [leaveTypeModel.leaveTypeId],
    }),
  })
)

export const employeeAttendanceRelations = relations(
  employeeAttendanceModel,
  ({ one }) => ({
    employee: one(employeeModel, {
      fields: [employeeAttendanceModel.employeeId],
      references: [employeeModel.employeeId],
    }),
  })
)

// ========================
// Types
// ========================
export type User = typeof userModel.$inferSelect
export type NewUser = typeof userModel.$inferInsert
export type Role = typeof roleModel.$inferSelect
export type NewRole = typeof roleModel.$inferInsert
export type Permission = typeof permissionsModel.$inferSelect
export type NewPermission = typeof permissionsModel.$inferInsert
export type UserRole = typeof userRolesModel.$inferSelect
export type NewUserRole = typeof userRolesModel.$inferInsert
export type RolePermission = typeof rolePermissionsModel.$inferSelect
export type NewRolePermission = typeof rolePermissionsModel.$inferInsert
export type Department = typeof departmentModel.$inferSelect
export type NewDepartment = typeof departmentModel.$inferInsert
export type Designation = typeof designationModel.$inferInsert
export type NewDesignation = typeof designationModel.$inferInsert
export type EmployeeType = typeof employeeTypeModel.$inferSelect
export type NewEmployeeType = typeof employeeTypeModel.$inferInsert
export type Employee = typeof employeeModel.$inferSelect
export type NewEmployee = typeof employeeModel.$inferInsert
export type Weekend = typeof weekendModel.$inferSelect
export type NewWeekend = typeof weekendModel.$inferInsert
export type OfficeTiming = typeof officeTimingModel.$inferSelect
export type NewOfficeTiming = typeof officeTimingModel.$inferInsert
export type Holiday = typeof holidayModel.$inferSelect
export type NewHoliday = typeof holidayModel.$inferInsert
export type LeaveType = typeof leaveTypeModel.$inferSelect
export type NewLeaveType = typeof leaveTypeModel.$inferInsert
export type EmployeeLeave = typeof employeeLeaveModel.$inferSelect
export type NewEmployeeLeave = typeof employeeLeaveModel.$inferInsert
export type EmployeeAttendance = typeof employeeAttendanceModel.$inferSelect
export type NewEmployeeAttendance = typeof employeeAttendanceModel.$inferInsert
