import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  officeTimingModel,
  officeTimingWeekendsModel,
  weekendModel,
} from '../schemas'

/* =========================
   CREATE
========================= */
export const createOfficeTiming = async (data: {
  startTime: string
  endTime: string
  weekendIds: number[]
  createdBy: number
}) => {
  return await db.transaction(async (tx) => {
    // 1️⃣ Insert the office timing
    const result = await tx.insert(officeTimingModel).values({
      startTime: data.startTime,
      endTime: data.endTime,
      createdBy: data.createdBy,
    })

    // 2️⃣ Get the generated officeTimingId
    const officeTimingId = result.lastInsertRowid

    // 3️⃣ Insert weekends if provided
    if (data.weekendIds?.length) {
      await tx.insert(officeTimingWeekendsModel).values(
        data.weekendIds.map((weekendId) => ({
          officeTimingId, // now guaranteed to exist
          weekendId,
          createdBy: data.createdBy,
        }))
      )
    }

    // 4️⃣ Return the inserted office timing info
    return {
      officeTimingId,
      startTime: data.startTime,
      endTime: data.endTime,
      weekendIds: data.weekendIds || [],
    }
  })
}

/* =========================
   GET ALL
========================= */
export const getAllOfficeTimings = async () => {
  const rows = await db
    .select({
      officeTimingId: officeTimingModel.officeTimingId,
      startTime: officeTimingModel.startTime,
      endTime: officeTimingModel.endTime,
      weekendId: officeTimingWeekendsModel.weekendId,
      weekendDay: weekendModel.day,
    })
    .from(officeTimingModel)
    .leftJoin(
      officeTimingWeekendsModel,
      eq(
        officeTimingModel.officeTimingId,
        officeTimingWeekendsModel.officeTimingId
      )
    )
    .leftJoin(
      weekendModel,
      eq(officeTimingWeekendsModel.weekendId, weekendModel.weekendId)
    )

  const map = new Map<number, any>()

  for (const row of rows) {
    if (!map.has(row.officeTimingId)) {
      map.set(row.officeTimingId, {
        officeTimingId: row.officeTimingId,
        startTime: row.startTime,
        endTime: row.endTime,
        weekendIds: [],
        weekends: [],
      })
    }

    if (row.weekendId) {
      const item = map.get(row.officeTimingId)

      item.weekendIds.push(row.weekendId)
      item.weekends.push(row.weekendDay)
    }
  }

  return Array.from(map.values())
}

/* =========================
   GET BY ID
========================= */
export const getOfficeTimingById = async (id: number) => {
  const rows = await db
    .select({
      officeTimingId: officeTimingModel.officeTimingId,
      startTime: officeTimingModel.startTime,
      endTime: officeTimingModel.endTime,
      weekendId: officeTimingWeekendsModel.weekendId,
    })
    .from(officeTimingModel)
    .leftJoin(
      officeTimingWeekendsModel,
      eq(
        officeTimingModel.officeTimingId,
        officeTimingWeekendsModel.officeTimingId
      )
    )
    .where(eq(officeTimingModel.officeTimingId, id))

  if (!rows.length) return null

  return {
    officeTimingId: rows[0].officeTimingId,
    startTime: rows[0].startTime,
    endTime: rows[0].endTime,
    weekendIds: rows.map((r) => r.weekendId).filter(Boolean),
  }
}

/* =========================
   UPDATE
========================= */
export const updateOfficeTiming = async (
  id: number,
  data: {
    startTime: string
    endTime: string
    weekendIds: number[]
    updatedBy: number
  }
) => {
  if (!id || isNaN(id)) throw new Error('Invalid officeTimingId')

  return await db.transaction(async (tx) => {
    await tx
      .update(officeTimingModel)
      .set({
        startTime: data.startTime,
        endTime: data.endTime,
        updatedBy: data.updatedBy,
        // updatedAt removed
      })
      .where(eq(officeTimingModel.officeTimingId, id))

    // Remove existing weekends
    await tx
      .delete(officeTimingWeekendsModel)
      .where(eq(officeTimingWeekendsModel.officeTimingId, id))

    // Insert new weekends
    if (Array.isArray(data.weekendIds) && data.weekendIds.length > 0) {
      await tx.insert(officeTimingWeekendsModel).values(
        data.weekendIds.map((weekendId) => ({
          officeTimingId: id,
          weekendId,
          createdBy: data.updatedBy,
        }))
      )
    }

    return true
  })
}

/* =========================
   DELETE
========================= */
export const deleteOfficeTiming = async (id: number) => {
  return await db.transaction(async (tx) => {
    // Delete related weekends first
    await tx
      .delete(officeTimingWeekendsModel)
      .where(eq(officeTimingWeekendsModel.officeTimingId, id))

    // Then delete the office timing
    await tx
      .delete(officeTimingModel)
      .where(eq(officeTimingModel.officeTimingId, id))

    return true
  })
}
