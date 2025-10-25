const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const PasswordChangeController = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;
        const db = getDB();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { password: hashedPassword } }
        );
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({ message: "Failed to change password", error });
    }
};
const forgetPassword = async (req, res) => {
    try {
        const { email} = req.body;
        const db = getDB();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const resetToken = Math.random().toString(36).substr(2); // Simple token generation
        const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now
        await usersCollection.updateOne(
            { email: email },
            { $set: { resetToken, resetTokenExpiry } }
        );
        const resetURL = `http://localhost:5173/resetPassword/${resetToken}`;
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.APP_EMAIL,
                pass: process.env.APP_PASS
            }
        });
        const mailOptions = {
            from: process.env.APP_EMAIL,
            to: email,
            subject: "Password Reset",
            html: `<p>Click here to reset your password: <a href="${resetURL}">${resetURL}</a></p>`,
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset link has been sent to your email" });
    } catch (error) {
        console.error("Forget password error:", error);
        res.status(500).json({ message: "Failed to process forget password", error });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const db = getDB();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword }, $unset: { resetToken: "", resetTokenExpiry: "" } }
        );
        res.json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Failed to reset password", error });
    }
};

module.exports = { PasswordChangeController , forgetPassword , resetPassword}; 