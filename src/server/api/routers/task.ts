import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  add: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string().optional().refine((data) => {
          // Check if the string can be parsed into a valid date
          return !data || !isNaN(Date.parse(data));
        }, {
          message: "Invalid date format, expected YYYY-MM-DDTHH:MM:SS.SSSZ",
        }).transform((data) => {
          // Transform the string to a date only if it's not undefined
          return data ? new Date(data) : undefined;
        }),
        isDone: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, description, dueDate, isDone } = input;
      const task = await ctx.db.task.create({
        data: {
          title,
          description,
          dueDate,
          isDone,
        },
      });
      return task;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.task.findMany({
      orderBy: [
        { isDone: 'asc' },  
        { dueDate: 'asc' },       
      ],
      where: {
        // Additional filters can go here if needed
      }
    });
  
    return tasks;
  }),
  delete: publicProcedure
  .input(z.object({
    id: z.string().min(1),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id } = input;
    await ctx.db.task.delete({
      where: {
        id
      }
    });
    return { deleted: true }; // Indicates successful deletion
  }),

    markDone: publicProcedure
    .input(z.object({
      id: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const task = await ctx.db.task.update({
        where: {
          id
        },
        data: {
          isDone: true, // Assuming you want to set `isDone` to true to mark it as done
        },
      });
      return task; // Also, ensure to return the updated task for client-side confirmation
    }),
    markUnDone: publicProcedure
    .input(z.object({
      id: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const task = await ctx.db.task.update({
        where: {
          id
        },
        data: {
          isDone: false, // Assuming you want to set `isDone` to true to mark it as done
        },
      });
      return task; // Also, ensure to return the updated task for client-side confirmation
    }),

    updateTask: publicProcedure
    .input(z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string().optional().refine((data) => {
          // Check if the string can be parsed into a valid date
          return !data || !isNaN(Date.parse(data));
        }, {
          message: "Invalid date format, expected YYYY-MM-DDTHH:MM:SS.SSSZ",
        }).transform((data) => {
          // Transform the string to a date only if it's not undefined
          return data ? new Date(data) : undefined;
        }),
    }))
    .mutation(async ({ ctx, input }) => {
        const { id, title, description, dueDate } = input;
        const task = await ctx.db.task.update({
            where: { id },
            data: { title, description, dueDate },
        });
        return task;
    }),
});