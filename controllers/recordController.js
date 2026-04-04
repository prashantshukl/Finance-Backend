import recordModel from "../models/recordModel.js";

const parseDate = (value) => {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const createRecord = async (req, res) => {
	try {
		const { amount, type, category, date, description } = req.body;

		if (amount === undefined || !type || !category || !date) {
			return res.status(400).json({ message: "Missing required fields." });
		}

		const parsedDate = parseDate(date);
		if (!parsedDate) {
			return res.status(400).json({ message: "Invalid date format." });
		}

		if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
			return res.status(400).json({ message: "Amount must be a positive number." });
		}

		const record = await recordModel.create({
			amount: Number(amount),
			type,
			category,
			date: parsedDate,
			description,
			createdBy: req.user._id,
		});

		return res.status(201).json({ message: "Record created.", data: record });
	} catch (error) {
		return res.status(500).json({ message: "Failed to create record." });
	}
};

const updateRecord = async (req, res) => {
	try {
		const { id } = req.params;
		const { amount, type, category, date, description } = req.body;

		const updates = {};
		if (amount !== undefined) {
			if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
				return res.status(400).json({ message: "Amount must be a positive number." });
			}
			updates.amount = Number(amount);
		}
		if (type) updates.type = type;
		if (category) updates.category = category;
		if (description !== undefined) updates.description = description;
		if (date) {
			const parsedDate = parseDate(date);
			if (!parsedDate) {
				return res.status(400).json({ message: "Invalid date format." });
			}
			updates.date = parsedDate;
		}

		const record = await recordModel.findOneAndUpdate(
			{ _id: id, isDeleted: false },
			updates,
			{ new: true, runValidators: true }
		);

		if (!record) {
			return res.status(404).json({ message: "Record not found." });
		}

		return res.status(200).json({ message: "Record updated.", data: record });
	} catch (error) {
		return res.status(500).json({ message: "Failed to update record." });
	}
};

const deleteRecord = async (req, res) => {
	try {
		const { id } = req.params;
		const record = await recordModel.findOneAndUpdate(
			{ _id: id, isDeleted: false },
			{ isDeleted: true, deletedAt: new Date() },
			{ new: true }
		);

		if (!record) {
			return res.status(404).json({ message: "Record not found." });
		}

		return res.status(200).json({ message: "Record deleted." });
	} catch (error) {
		return res.status(500).json({ message: "Failed to delete record." });
	}
};

const getRecord = async (req, res) => {
	try {
		const { id } = req.params;
		const record = await recordModel.findOne({ _id: id, isDeleted: false }).lean();

		if (!record) {
			return res.status(404).json({ message: "Record not found." });
		}

		return res.status(200).json({ data: record });
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch record." });
	}
};

const getAllRecords = async (req, res) => {
	try {
		const page = Number(req.query.page || 1);
		const limit = Math.min(Number(req.query.limit || 10), 100);
		const skip = (page - 1) * limit;
		const sortBy = req.query.sortBy || "date";
		const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

		const [records, total] = await Promise.all([
			recordModel
				.find({ isDeleted: false })
				.sort({ [sortBy]: sortOrder })
				.skip(skip)
				.limit(limit)
				.lean(),
			recordModel.countDocuments({ isDeleted: false }),
		]);

		return res.status(200).json({
			data: records,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch records." });
	}
};

const getRecordsWithFilters = async (req, res) => {
	try {
		const { type, category, startDate, endDate, minAmount, maxAmount, search } = req.query;
		const page = Number(req.query.page || 1);
		const limit = Math.min(Number(req.query.limit || 10), 100);
		const skip = (page - 1) * limit;

		const filter = { isDeleted: false };
		if (type) filter.type = type;
		if (category) filter.category = category;

		if (startDate || endDate) {
			filter.date = {};
			const parsedStart = parseDate(startDate);
			const parsedEnd = parseDate(endDate);
			if (startDate && !parsedStart) {
				return res.status(400).json({ message: "Invalid startDate." });
			}
			if (endDate && !parsedEnd) {
				return res.status(400).json({ message: "Invalid endDate." });
			}
			if (parsedStart) filter.date.$gte = parsedStart;
			if (parsedEnd) filter.date.$lte = parsedEnd;
		}

		if (minAmount || maxAmount) {
			filter.amount = {};
			if (minAmount && Number.isFinite(Number(minAmount))) {
				filter.amount.$gte = Number(minAmount);
			}
			if (maxAmount && Number.isFinite(Number(maxAmount))) {
				filter.amount.$lte = Number(maxAmount);
			}
		}

		if (search) {
			filter.description = { $regex: search, $options: "i" };
		}

		const [records, total] = await Promise.all([
			recordModel.find(filter).skip(skip).limit(limit).lean(),
			recordModel.countDocuments(filter),
		]);

		return res.status(200).json({
			data: records,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to filter records." });
	}
};

export {
	createRecord,
	updateRecord,
	deleteRecord,
	getRecord,
	getAllRecords,
	getRecordsWithFilters,
};