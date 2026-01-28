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
    dob: text('dob').notNull(),
    doj: text('doj').notNull(),
    gender: text('gender').notNull(),
    bloodGroup: text('blood_group'),
    basicSalary: real('basic_salary').notNull(),
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


export const employeeWeekendModel = sqliteTable(
  'employee_weekends',
  {
    employeeWeekendId: integer('id').primaryKey({ autoIncrement: true }),
    employeeId: integer('employee_id')
      .notNull()
      .references(() => employeeModel.employeeId, { onDelete: 'cascade' }),

    weekendId: integer('weekend_id')
      .notNull()
      .references(() => weekendModel.weekendId, { onDelete: 'cascade' }),
  },
)


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

export const employeeWeekendRelations = relations(
  employeeWeekendModel,
  ({ one }) => ({
    employee: one(employeeModel, {
      fields: [employeeWeekendModel.employeeId],
      references: [employeeModel.employeeId],
    }),
    weekend: one(weekendModel, {
      fields: [employeeWeekendModel.weekendId],
      references: [weekendModel.weekendId],
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
