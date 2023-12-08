import prisma from "../../prisma/prisma";
import { Prisma } from "@prisma/client";

export async function createUser({ wallet }: Prisma.UserUncheckedCreateInput) {
  const user = await prisma.user.upsert({
    where: { wallet: wallet },
    update: {},
    create: {
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

export async function getProjectByContractAddress(contractAddress: string) {
  return prisma.project.findFirst({
    where: {
      contractAddress,
    },
  });
}

export async function getWhitelistByProjectId(projectId: any) {
  return prisma.whitelist.findMany({
    where: {
      projectId,
    },
  });
}

export async function addWhitelist(whitelistData: any[], cid: string) {
  const whitelisted = await prisma.whitelist.createMany({
    data: whitelistData,
  });

  // Update the CID in the Project model
  const updatedProject = await prisma.project.update({
    where: { id: whitelistData[0].projectId },
    data: {
      csvCid: cid + "",
    },
  });

  return { whitelisted, updatedProject };
}

export async function createClaimToken({
  contractAddress,
  tokenId,
  transactionHash,
  chainId,
  walletAddress,
  amount,
}: any) {
  const project = await getProjectByContractAddress(contractAddress);
  if (!project) {
    throw new Error("Project not found");
  }

  const user = await prisma.user.findFirst({
    where: {
      wallet: walletAddress,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  const token = await prisma.token.upsert({
    where: {
      projectId_tokenId: {
        projectId: project.id,
        tokenId,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      contractAddress,
      tokenId,
      transactionHash,
      chainId,
      amount,
      walletAddress,
      userId: user.id,
    },
  });

  return token;
}
