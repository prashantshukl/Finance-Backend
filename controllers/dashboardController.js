import recordModel from "../models/recordModel.js";

const getSummary = async (req, res) => {
  try {
    const summary = await recordModel.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const categoryTotals = await recordModel.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const recentActivity = await recordModel
      .find({ isDeleted: false })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const income = summary.find((item) => item._id === "Income")?.total || 0;
    const expense = summary.find((item) => item._id === "Expense")?.total || 0;

    return res.status(200).json({
      data: {
        totalIncome: income,
        totalExpense: expense,
        netBalance: income - expense,
        categoryTotals: categoryTotals.map((item) => ({
          category: item._id,
          total: item.total,
        })),
        recentActivity,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch summary." });
  }
};

const getTrends = async (req, res) => {
  try {
    const interval = req.query.interval || "month";
    const last = Math.min(Number(req.query.last || 6), 24);

    const dateFormat = interval === "week" ? "%G-W%V" : "%Y-%m";
    const data = await recordModel.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: dateFormat, date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.period": -1 } },
      { $limit: last * 2 },
    ]);

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch trends." });
  }
};

export { getSummary, getTrends };
