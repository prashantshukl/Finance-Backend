import crypto from "crypto";
import userModel from "../models/userModel.js";

const hashPassword = (password) =>
	crypto.createHash("sha256").update(password).digest("hex");

const createUser = async (req, res) => {
	try {
		const { username, email, password, role, isActive } = req.body;

		if (!username || !password) {
			return res.status(400).json({ message: "Username and password are required." });
		}

		const existing = await userModel.findOne({ username }).lean();
		if (existing) {
			return res.status(409).json({ message: "Username already exists." });
		}

		const user = await userModel.create({
			username,
			email,
			role,
			isActive: isActive ?? true,
			password: hashPassword(password),
		});

		return res.status(201).json({
			message: "User created successfully.",
			data: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
				isActive: user.isActive,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to create user." });
	}
};

const updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const { username, email, role, isActive, password } = req.body;

		const updates = {};
		if (username) updates.username = username;
		if (email) updates.email = email;
		if (role) updates.role = role;
		if (typeof isActive === "boolean") updates.isActive = isActive;
		if (password) updates.password = hashPassword(password);

		const user = await userModel.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		});

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		return res.status(200).json({
			message: "User updated successfully.",
			data: {
				id: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
				isActive: user.isActive,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to update user." });
	}
};

const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await userModel.findByIdAndUpdate(
			id,
			{ isActive: false },
			{ new: true }
		);

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		return res.status(200).json({ message: "User deactivated successfully." });
	} catch (error) {
		return res.status(500).json({ message: "Failed to delete user." });
	}
};

const getUsers = async (req, res) => {
	try {
		const page = Number(req.query.page || 1);
		const limit = Math.min(Number(req.query.limit || 10), 100);
		const skip = (page - 1) * limit;

		const [users, total] = await Promise.all([
			userModel
				.find()
				.select("username email role isActive createdAt updatedAt")
				.skip(skip)
				.limit(limit)
				.lean(),
			userModel.countDocuments(),
		]);

		return res.status(200).json({
			data: users,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch users." });
	}
};

const getUserById = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await userModel
			.findById(id)
			.select("username email role isActive createdAt updatedAt")
			.lean();

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		return res.status(200).json({ data: user });
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch user." });
	}
};

export { createUser, updateUser, deleteUser, getUsers, getUserById };