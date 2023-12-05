import prisma from "../../prisma/prisma";
import { Prisma } from "@prisma/client";

export async function createUser({ wallet }: Prisma.UserUncheckedCreateInput) {
  const user = await prisma.user.create({
    data: {
      wallet,
    },
  });

  return user;
}

export async function createProject({
  name,
  symbol,
  pricePerToken,
  amountRaised,
  totalSupply,
  saftDetails,
  contractAddress,
  transactionHash,
  chainId,
  userId,
}: any) {
  const project = await prisma.project.create({
    data: {
      name,
      amountRaised,
      pricePerToken,
      saftDetails,
      contractAddress,
      transactionHash,
      chainId,
      symbol,
      totalSupply,
      userId,
    },
  });
  return project;
}

export async function getAllSafts(wallet: string) {
  const user = await prisma.user.findUnique({
    where: {
      wallet,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const safts = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
  });

  return safts;
}
