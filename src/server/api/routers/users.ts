import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ySort } from "../../../utils/mymath";
import type { UserEntity } from "../../db";
import { UserDb } from "../../db";
import { toTreeDto } from "../../dto";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const TreeValidator = z.array(
  z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  })
);

export const usersRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (userId) {
      await UserDb.create({
        id: userId,
        shardId: new Date().getTime(),
      });
    }
    return {
      success: true,
    };
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        trees: TreeValidator,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (userId) {
        const userShards = await UserDb.find({ id: userId });
        if (userShards.length === 0) throw new Error("No user found");
        userShards.sort((a, b) => a.shardId - b.shardId);
        const latestShard = userShards[userShards.length - 1];
        if (!latestShard) throw new Error("No shard found");

        // TODO sharding support and ysort of trees
        await UserDb.update(
          {
            id: userId,
            shardId: latestShard?.shardId || new Date().getTime(),
            trees: input.trees,
          },
          {
            exists: null, // means upsert https://github.com/sensedeep/dynamodb-onetable/issues/307#issuecomment-1078270210
          }
        );
      }
      return {
        success: true,
      };
    }),

  createMe: protectedProcedure
    .input(z.object({ trees: TreeValidator }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (userId) {
        const userShards = await UserDb.find({ id: userId });
        if (userShards.length !== 0) return { error: "User already exists" };
        await UserDb.create({
          id: userId,
          shardId: new Date().getTime(),
          trees: input.trees,
        });
        return {
          success: true,
        };
      }
      return { error: "No user id. Please login first." };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (userId) {
      const userShards = await UserDb.find({ id: userId });
      if (userShards.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user found",
        });
      }
      const userDto = userEntityToDto(userShards, userId);
      return {
        user: userDto,
      };
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No user id. Please login first.", // how could this happen?
    });
  }),
});

const userEntityToDto = (userShards: UserEntity[], userId: string) => {
  const trees = userShards
    .flatMap((shard) => shard.trees?.map(toTreeDto) || [])
    .sort(ySort);
  return {
    id: userId,
    trees,
  };
};
