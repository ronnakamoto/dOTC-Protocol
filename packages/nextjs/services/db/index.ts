import prisma from "../../prisma/prisma";
import { OrderStatus, OrderType, Prisma, WalletTxnStatus, WalletTxnType } from "@prisma/client";

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

  // create user accounts as well
  await prisma.user.createMany({
    data: whitelistData.map(w => ({
      wallet: w.userWalletAddress,
    })),
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

export async function getCurrentMarketPriceByContract(contractAddress: string) {
  const project = await getProjectByContractAddress(contractAddress);
  if (!project) {
    throw new Error("Project not found");
  }
  const initialPrice = project.pricePerToken;

  const latestTrade = await prisma.trade.findFirst({
    where: {
      projectId: project.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      price: true,
    },
  });

  return latestTrade?.price ?? initialPrice;
}

export async function getPrice24HoursAgo(contractAddress: string) {
  const date24HoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const project = await getProjectByContractAddress(contractAddress);
  if (!project) {
    throw new Error("Project not found");
  }
  const initialPrice = project.pricePerToken;
  const trade24HoursAgo = await prisma.trade.findFirst({
    where: {
      projectId: project.id,
      createdAt: {
        lt: date24HoursAgo,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      price: true,
    },
  });

  return trade24HoursAgo?.price ?? initialPrice;
}

export async function getPricesOfAllProjects(walletAddress: string) {
  const whitelist = await prisma.whitelist.findMany({
    where: {
      userWalletAddress: walletAddress,
    },
    include: {
      project: {
        include: {
          Trade: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });

  const safts = whitelist.map(w => ({
    id: w.projectId,
    name: w.project.name,
    symbol: w.project.symbol,
    contractAddress: w.project.contractAddress,
    price: w.project.Trade.length ? w.project.Trade[0].price : w.project.pricePerToken,
  }));

  return safts;
}

export async function getAvailableBalance(contractAddress: string, walletAddress: string) {
  // Initial mint balance
  const initialBalance = await prisma.whitelist.findFirst({
    where: {
      project: {
        contractAddress,
      },
      userWalletAddress: walletAddress,
    },
    select: {
      amount: true,
    },
  });
  console.log("🚀 ~ file: index.ts:239 ~ getAvailableBalance ~ initialBalance:", initialBalance);

  // Calculate the impact of buy orders (filled and partially filled)
  const buyOrdersSum = await prisma.order.aggregate({
    where: {
      project: {
        contractAddress,
      },
      user: {
        wallet: walletAddress,
      },
      type: OrderType.BUY,
      status: {
        in: [OrderStatus.FILLED, OrderStatus.PARTIALLY_FILLED, OrderStatus.OPEN],
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Calculate the impact of sell orders (filled and partially filled)
  const sellOrdersSum = await prisma.order.aggregate({
    where: {
      project: {
        contractAddress,
      },
      user: {
        wallet: walletAddress,
      },
      type: OrderType.SELL,
      status: {
        in: [OrderStatus.FILLED, OrderStatus.PARTIALLY_FILLED, OrderStatus.OPEN],
      },
    },
    _sum: {
      amount: true,
    },
  });
  console.log("🚀 ~ file: index.ts:278 ~ getAvailableBalance ~ sellOrdersSum:", sellOrdersSum);

  // Calculate the available balance
  const availableBalance =
    (initialBalance?.amount ?? 0) + (buyOrdersSum._sum.amount ?? 0) - (sellOrdersSum._sum.amount ?? 0);
  console.log("🚀 ~ file: index.ts:280 ~ getAvailableBalance ~ availableBalance:", availableBalance);

  return availableBalance;
}

export async function createSellOrder({ contractAddress, price, amount, walletAddress }: any) {
  // Step 1: Find the user based on walletAddress
  const user = await prisma.user.findUnique({
    where: {
      wallet: walletAddress,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Step 2: Find the project based on contractAddress
  const project = await prisma.project.findFirst({
    where: {
      contractAddress: contractAddress,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Step 3: Create a new sell order
  const sellOrder = await prisma.order.create({
    data: {
      userId: user.id,
      projectId: project.id,
      type: OrderType.SELL,
      status: OrderStatus.OPEN,
      price: price,
      amount: amount,
    },
  });
  console.log("🚀 ~ file: index.ts:321 ~ createSellOrder ~ sellOrder:", sellOrder);

  return sellOrder;
}

export async function getOpenBuyOrders(contractAddress: string): Promise<any[]> {
  return await prisma.order.findMany({
    where: {
      type: OrderType.BUY,
      status: OrderStatus.OPEN,
      project: {
        contractAddress: contractAddress,
      },
    },
  });
}

export async function getOpenSellOrders(contractAddress: string): Promise<any[]> {
  return await prisma.order.findMany({
    where: {
      type: OrderType.SELL,
      status: OrderStatus.OPEN,
      project: {
        contractAddress: contractAddress,
      },
    },
  });
}

export async function savePendingDeposit({ contractAddress, walletAddress, amount, transactionHash }: any) {
  const user = await prisma.user.findUnique({
    where: {
      wallet: walletAddress,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.wallet.create({
    data: {
      contractAddress,
      userId: user.id,
      amount,
      transactionHash,
      status: WalletTxnStatus.PENDING,
      transactionType: WalletTxnType.DEPOSIT,
    },
  });
}

export async function finalizeDeposit({ transactionHash }: any) {
  console.log("🚀 ~ file: index.ts:375 ~ finalizeDeposit ~ transactionHash:", transactionHash);
  try {
    return await prisma.wallet.update({
      where: {
        transactionHash,
      },
      data: {
        status: WalletTxnStatus.PROCESSED,
      },
    });
  } catch (error) {
    console.error("Error in finalizeDeposit:", error);
    throw error; // or handle it as appropriate
  }
}

export async function getAllDeposits({ walletAddress }: any) {
  const user = await prisma.user.findUnique({
    where: {
      wallet: walletAddress,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return await prisma.wallet.findMany({
    where: {
      userId: user.id,
    },
  });
}

export async function fetchOrdersFromMempool() {
  try {
    const mempoolOrders = await prisma.order.findMany({
      where: {
        mempool: true,
      },
    });
    return mempoolOrders;
  } catch (error) {
    console.error("Error fetching orders from mempool:", error);
    throw error;
  }
}

export async function registerBundler({ registrationId, requestId }: any) {
  try {
    const bundler = await prisma.orderBundler.upsert({
      where: {
        registrationId,
      },
      update: {},
      create: {
        registrationId,
        requestId,
      },
    });
    return bundler;
  } catch (error) {
    console.error("Error registering bundler:", error);
    throw error;
  }
}
