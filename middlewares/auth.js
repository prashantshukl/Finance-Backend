import userModel from "../models/userModel.js";

const roleRank = {
	Viewer: 1,
	Analyst: 2,
	Admin: 3,
};

const authenticateUser = async (req, res) => {
	const userId = req.header("x-user-id");
	if (!userId) {
		res.status(401).json({ message: "Missing x-user-id header." });
		return null;
	}

	const user = await userModel.findById(userId).lean();
	if (!user) {
		res.status(401).json({ message: "Invalid user." });
		return null;
	}

	if (!user.isActive) {
		res.status(403).json({ message: "User is inactive." });
		return null;
	}

	return user;
};

const requireRole = (minRole) => async (req, res, next) => {
	try {
		const user = await authenticateUser(req, res);
		if (!user) return;

		const userRole = user.role || "Viewer";
		if (roleRank[userRole] < roleRank[minRole]) {
			return res.status(403).json({ message: "Insufficient permissions." });
		}

		req.user = user;
		return next();
	} catch (error) {
		return res.status(500).json({ message: "Failed to authenticate user." });
	}
};

const adminAuth = requireRole("Admin");
const analystAuth = requireRole("Analyst");
const userAuth = requireRole("Viewer");

export { adminAuth, analystAuth, userAuth };