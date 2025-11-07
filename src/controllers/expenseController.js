import prisma from "../config/db.js";
import logger from "../config/logger.js";


export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: { 
        payer: true, 
        participants: { 
          include: { 
            user: true 
          } 
        } 
      },
      orderBy: {
        createdAt: 'desc' // Add sorting by creation date
      }
    });
    
    res.status(200).json({ 
      success: true, 
      data: expenses 
    });
  } catch (err) {
    logger.error("Error fetching expenses: " + err.message);
    next(err);
  }
};


export const createExpense = async (req, res, next) => {
  try {
    const { title, amount, payerId, participantIds } = req.body;

    // ✅ Step 1: Validate required fields
    if (!title?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Expense title is required" 
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Valid amount is required" 
      });
    }

    if (!payerId) {
      return res.status(400).json({ 
        success: false,
        message: "Payer is required" 
      });
    }

    if (!participantIds?.length) {
      return res.status(400).json({ 
        success: false,
        message: "At least one participant is required" 
      });
    }

    // ✅ Step 2: Remove duplicates and ensure payer is included
    const uniqueParticipantIds = [...new Set([...participantIds, payerId])];
    
    if (uniqueParticipantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid participants found"
      });
    }

    // ✅ Step 3: Check that all user IDs exist
    const users = await prisma.user.findMany({
      where: { 
        id: { 
          in: uniqueParticipantIds.map(id => parseInt(id)) 
        } 
      },
      select: { id: true, name: true },
    });

    const existingUserIds = users.map((u) => u.id);
    const missingIds = uniqueParticipantIds.filter(
      (id) => !existingUserIds.includes(parseInt(id))
    );

    if (missingIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid user IDs: ${missingIds.join(", ")}`
      });
    }

    // ✅ Step 4: Calculate share per person
    const share = parseFloat((amount / uniqueParticipantIds.length).toFixed(2));
    const totalCalculated = share * uniqueParticipantIds.length;
    
    // Validate calculation to avoid floating point issues
    if (Math.abs(totalCalculated - amount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: "Amount calculation error. Please check the values."
      });
    }

    // ✅ Step 5: Create expense with all participants (including payer)
    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        amount: parseFloat(amount),
        payerId: parseInt(payerId),
        participants: {
          create: uniqueParticipantIds.map((id) => ({
            userId: parseInt(id),
            share: share,
          })),
        },
      },
      include: { 
        payer: true, 
        participants: { 
          include: { 
            user: true 
          } 
        } 
      },
    });

    // ✅ Step 6: Return success response
    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });

  } catch (err) {
    logger.error("Error creating expense: " + err.message);
    
    // Handle Prisma specific errors
    if (err.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Expense with similar details already exists"
      });
    }
    
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Invalid user reference"
      });
    }

    next(err);
  }
};



// ✅ Compute accurate balance sheet
// export const getBalanceSheet = async (req, res, next) => {
//   try {
//     const expenses = await prisma.expense.findMany({
//       include: {
//         payer: true,
//         participants: { include: { user: true } },
//       },
//     });

//     const balances = {};

//     // 🧮 Step 1: Calculate balances for each user
//     for (const expense of expenses) {
//       balances[expense.payerId] = (balances[expense.payerId] || 0) + expense.amount;
//       for (const p of expense.participants) {
//         balances[p.userId] = (balances[p.userId] || 0) - p.share;
//       }
//     }

//     // 🧍 Step 2: Get user names
//     const users = await prisma.user.findMany();
//     const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

//     const creditors = [];
//     const debtors = [];

//     // 🧾 Step 3: Split users into creditors & debtors
//     for (const [id, balance] of Object.entries(balances)) {
//       if (balance > 0) creditors.push({ id: +id, balance });
//       else if (balance < 0) debtors.push({ id: +id, balance });
//     }

//     // 💸 Step 4: Calculate “who pays whom”
//     const transactions = [];
//     for (const debtor of debtors) {
//       let debt = -debtor.balance;
//       for (const creditor of creditors) {
//         if (debt <= 0) break;
//         if (creditor.balance <= 0) continue;

//         const amount = Math.min(debt, creditor.balance);
//         transactions.push({
//           fromUser: userMap[debtor.id],
//           toUser: userMap[creditor.id],
//           amount: parseFloat(amount.toFixed(2)),
//         });

//         creditor.balance -= amount;
//         debt -= amount;
//       }
//     }

//     res.status(200).json({
//       success: true,
//       data: transactions,
//     });
//   } catch (err) {
//     console.error("Error computing balances:", err);
//     res.status(500).json({
//       success: false,
//       message: "Error computing balance sheet",
//     });
//   }
// };



// ✅ Compute accurate balance sheet (Alternative approach)
export const getBalanceSheet = async (req, res, next) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        payer: true,
        participants: { include: { user: true } },
      },
    });

    const balances = {};

    // 🧮 Step 1: Calculate net balances for each user
    for (const expense of expenses) {
      const totalParticipants = expense.participants.length;
      const sharePerPerson = parseFloat((expense.amount / totalParticipants).toFixed(2));
      
      // Initialize balances if not exists
      if (!balances[expense.payerId]) {
        balances[expense.payerId] = 0;
      }
      
      // Payer gets credit for the amount they paid
      balances[expense.payerId] += expense.amount;
      
      // Each participant owes their share
      for (const participant of expense.participants) {
        const userId = participant.userId;
        
        if (!balances[userId]) {
          balances[userId] = 0;
        }
        
        // Everyone (including payer) owes their share
        balances[userId] -= sharePerPerson;
      }
    }

    // 🧍 Step 2: Get user details
    const users = await prisma.user.findMany();
    const userMap = Object.fromEntries(users.map(u => [u.id, { name: u.name, phoneNumber: u.phoneNumber }]));

    // 🧾 Step 3: Prepare creditors and debtors
    const creditors = [];
    const debtors = [];

    for (const [userId, balance] of Object.entries(balances)) {
      const netBalance = parseFloat(balance.toFixed(2));
      const userInfo = userMap[parseInt(userId)];
      
      if (netBalance > 0.01) {
        creditors.push({
          id: parseInt(userId),
          name: userInfo.name,
          phoneNumber: userInfo.phoneNumber,
          amount: netBalance
        });
      } else if (netBalance < -0.01) {
        debtors.push({
          id: parseInt(userId),
          name: userInfo.name,
          phoneNumber: userInfo.phoneNumber,
          amount: Math.abs(netBalance)
        });
      }
    }

    // Sort by amount (highest first)
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // 💸 Step 4: Calculate transactions
    const transactions = [];
    
    let cIndex = 0;
    let dIndex = 0;

    while (cIndex < creditors.length && dIndex < debtors.length) {
      const creditor = creditors[cIndex];
      const debtor = debtors[dIndex];
      
      const settleAmount = parseFloat(Math.min(creditor.amount, debtor.amount).toFixed(2));
      
      transactions.push({
        from: debtor.name,
        fromId: debtor.id,
        to: creditor.name,
        toId: creditor.id,
        amount: settleAmount
      });

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      if (creditor.amount < 0.01) cIndex++;
      if (debtor.amount < 0.01) dIndex++;
    }

    res.status(200).json({
      success: true,
      data: {
        transactions,
        creditors,
        debtors,
        summary: {
          totalSettlement: transactions.reduce((sum, t) => sum + t.amount, 0),
          totalTransactions: transactions.length
        }
      }
    });

  } catch (err) {
    console.error("Error computing balances:", err);
    res.status(500).json({
      success: false,
      message: "Error computing balance sheet",
    });
  }
};