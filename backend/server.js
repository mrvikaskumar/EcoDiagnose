import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Item from './models/Item.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import Partner from './models/Partner.js';
import Request from './models/Request.js';
import Feedback from './models/Feedback.js'; // NEW: Feedback Model added

// --- ES MODULE WORKAROUND FOR __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer to save uploaded files into an 'uploads' folder temporary
const upload = multer({ dest: 'uploads/' });

// Ensure the temporary uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Successfully Connected!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- API ROUTES ---

app.get('/', (req, res) => {
    res.send('E-Waste Smart Backend is running!');
});

// Original inventory route
app.post('/api/inventory', async (req, res) => {
    try {
        const { itemName, confidenceScore } = req.body;
        const newItem = new Item({ itemName, confidenceScore });
        await newItem.save();
        console.log(`Saved new ${itemName} to database!`);
        res.status(201).json({ success: true, message: 'Item saved!', data: newItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// --- NEW AI ANALYSIS ROUTE ---
app.post('/api/analyze', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    const absoluteImagePath = path.resolve(req.file.path);
    const aiServiceFolder = path.join(__dirname, '../Ai-Service');
    const pythonScript = 'analyzer_api.py';

    console.log("📸 Received image, running AI analysis...");

    const pythonExecutable = path.join(aiServiceFolder, 'env', 'Scripts', 'python.exe');

    if (!fs.existsSync(pythonExecutable)) {
        console.error(`❌ CRITICAL ERROR: Python executable not found at ${pythonExecutable}`);
        if (fs.existsSync(absoluteImagePath)) fs.unlinkSync(absoluteImagePath);
        return res.status(500).json({ error: "AI Environment is broken. Check backend logs." });
    }

    const pythonProcess = spawn(pythonExecutable, [pythonScript, absoluteImagePath], { cwd: aiServiceFolder });

    let aiOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        aiOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`⚠️ Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (fs.existsSync(absoluteImagePath)) {
            fs.unlinkSync(absoluteImagePath);
        }

        try {
            const jsonString = aiOutput.substring(aiOutput.indexOf('{'), aiOutput.lastIndexOf('}') + 1);
            const result = JSON.parse(jsonString);

            console.log("🧠 AI Result:", result);
            res.json(result);
        } catch (error) {
            console.error("❌ Failed to parse Python output. Raw output was:", aiOutput);
            res.status(500).json({ error: "Failed to process AI results" });
        }
    });
});

// --- PARTNER AUTH ROUTES ---
app.post('/api/partner/register', async (req, res) => {
    try {
        const { email } = req.body;
        const existingPartner = await Partner.findOne({ email });
        if (existingPartner) {
            return res.status(400).json({ error: "Email already registered. Please login." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60000);

        const newPartner = new Partner({
            ...req.body,
            otp,
            otpExpires,
            isVerified: false
        });
        await newPartner.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EcoDiagnose - Partner Verification OTP',
            html: `<h3>Welcome to EcoDiagnose!</h3><p>Your verification code is: <b style="font-size:24px; color:green;">${otp}</b></p><p>This code expires in 10 minutes.</p>`
        };
        await transporter.sendMail(mailOptions);

        console.log(`✅ Registration OTP sent to ${email}`);
        res.status(200).json({ message: "OTP sent to email" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during registration" });
    }
});

app.post('/api/partner/login', async (req, res) => {
    try {
        const { email } = req.body;
        const partner = await Partner.findOne({ email });
        if (!partner) {
            return res.status(404).json({ error: "Partner not found. Please register." });
        }

        // NEW: Security check to prevent blocked partners from logging in
        if (partner.isBlocked) {
            return res.status(403).json({ error: "Your account has been blocked by an Administrator due to a policy violation." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        partner.otp = otp;
        partner.otpExpires = new Date(Date.now() + 10 * 60000);
        await partner.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EcoDiagnose - Partner Login OTP',
            html: `<h3>EcoDiagnose Partner Portal</h3><p>Your login code is: <b style="font-size:24px; color:green;">${otp}</b></p>`
        };
        await transporter.sendMail(mailOptions);

        console.log(`✅ Login OTP sent to ${email}`);
        res.status(200).json({ message: "OTP sent to email" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during login" });
    }
});

app.post('/api/partner/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const partner = await Partner.findOne({ email });
        if (!partner) return res.status(404).json({ error: "Partner not found" });

        if (partner.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
        if (partner.otpExpires < new Date()) return res.status(400).json({ error: "OTP has expired" });

        partner.isVerified = true;
        partner.otp = undefined;
        partner.otpExpires = undefined;
        await partner.save();

        console.log(`🔓 Partner ${email} successfully verified!`);
        res.status(200).json({ message: "Verification successful", partnerId: partner._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during verification" });
    }
});

app.get('/api/partner/:id', async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ error: "Partner not found" });
        res.status(200).json(partner);
    } catch (error) {
        console.error("Error fetching partner:", error);
        res.status(500).json({ error: "Failed to fetch partner details" });
    }
});

app.put('/api/partner/:id', async (req, res) => {
    try {
        const updatedPartner = await Partner.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedPartner) return res.status(404).json({ error: "Partner not found" });

        console.log(`✏️ Partner ${updatedPartner.businessName} updated their profile.`);
        res.status(200).json(updatedPartner);
    } catch (error) {
        console.error("Error updating partner:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// --- EMAIL API SETUP (Bypassing Render SMTP Block) ---
// We created a custom "transporter" that uses Brevo's HTTP API instead of Nodemailer.
// This allows all your existing .sendMail() functions to work perfectly without changing them!
const transporter = {
    sendMail: async (mailOptions) => {
        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY, // Your new API key
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "EcoDiagnose System", email: process.env.EMAIL_USER },
                    to: [{ email: mailOptions.to }],
                    subject: mailOptions.subject,
                    htmlContent: mailOptions.html
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Brevo API Error Details:", errorData);
                throw new Error("Failed to send email via API");
            }

            console.log(`✅ API Email successfully sent to ${mailOptions.to}`);
            return await response.json();
        } catch (error) {
            console.error("❌ Critical Email Error:", error);
            throw error;
        }
    }
};

// --- USER REQUEST ROUTES ---

app.post('/api/requests', async (req, res) => {
    try {
        const { userName, userEmail } = req.body;
        const trackerId = 'ECO-' + Math.floor(100000 + Math.random() * 900000).toString();

        const newRequest = new Request({
            ...req.body,
            trackerId
        });
        await newRequest.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'EcoDiagnose - Your E-Waste Request Received',
            html: `
                <h3>Hello ${userName},</h3>
                <p>Thank you for choosing to recycle responsibly!</p>
                <p>Your device has been analyzed and added to our local partner marketplace.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #374151;">Your Tracking ID:</p>
                    <h2 style="margin: 5px 0; color: #16a34a; letter-spacing: 2px;">${trackerId}</h2>
                </div>
                <p>You can use this ID on our website to track the status of your request.</p>
                <p>We will email you again the moment a recycling partner claims your item.</p>
            `
        };
        await transporter.sendMail(mailOptions);

        console.log(`📥 New Request saved & email sent: ${trackerId}`);
        res.status(201).json({ success: true, trackerId, request: newRequest });
    } catch (error) {
        console.error("Error saving request:", error);
        res.status(500).json({ error: "Failed to process request" });
    }
});

app.get('/api/requests', async (req, res) => {
    try {
        const requests = await Request.find({ status: 'Pending' }).lean().sort({ createdAt: -1 });

        const safeRequests = requests.map(item => {

            // 1. Target the exact variable names your frontend used
            item.userName = "🔒 Anonymous User";
            item.userEmail = "🔒 Hidden";
            item.userMobile = "🔒 Hidden"; // This will finally hide the phone!

            // 2. Hide Tracking ID
            item.trackerId = "🔒 Hidden";

            // 3. Hide the location, but SAVE the note
            if (item.userAddress) {
                // Your frontend combines them like: "Address... - Pincode. Note: The Note"
                // We split the string at ". Note: "
                const noteParts = item.userAddress.split('. Note: ');

                if (noteParts.length > 1) {
                    // If a note exists, keep the note but replace the address
                    item.userAddress = "🔒 Location hidden until claimed. Note: " + noteParts[1];
                } else {
                    // If there is no note, just hide the whole thing
                    item.userAddress = "🔒 Location hidden until claimed";
                }
            }

            return item;
        });

        res.status(200).json(safeRequests);
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ error: "Failed to fetch requests" });
    }
});

app.get('/api/requests/track/:trackerId', async (req, res) => {
    try {
        const { trackerId } = req.params;
        const request = await Request.findOne({ trackerId: trackerId.toUpperCase() })
            .populate('claimedBy', 'businessName mobile email');

        if (!request) {
            return res.status(404).json({ error: "We couldn't find a request with that Tracking ID." });
        }
        res.status(200).json(request);
    } catch (error) {
        console.error("Error tracking request:", error);
        res.status(500).json({ error: "Server error while searching." });
    }
});

app.post('/api/requests/:id/claim', async (req, res) => {
    try {
        const { partnerId } = req.body;
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ error: "Request not found" });
        if (request.status !== 'Pending') return res.status(400).json({ error: "Item already claimed" });

        request.status = 'Claimed';
        request.claimedBy = partnerId;
        await request.save();

        const partner = await Partner.findById(partnerId);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: request.userEmail,
            subject: '🎉 Good News! Your EcoDiagnose E-Waste has been Claimed',
            html: `
                <h3>Hello ${request.userName},</h3>
                <p>Great news! A certified recycling partner has claimed your <b>${request.product}</b>.</p>
                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #166534;">Partner Contact Details:</h4>
                    <p><b>Organization:</b> ${partner.businessName}</p>
                    <p><b>Phone:</b> +91 ${partner.mobile}</p>
                    <p><b>Email:</b> ${partner.email}</p>
                    <p><b>Address:</b> ${partner.address}, ${partner.city}</p>
                </div>
                <p>The partner will contact you shortly to arrange the pickup, or you can reach out to them directly using the details above.</p>
                <p>Thank you for making the world greener!</p>
                <p><b>Your Tracker ID:</b> ${request.trackerId}</p>
            `
        };
        await transporter.sendMail(mailOptions);

        console.log(`✅ Request ${request.trackerId} claimed by ${partner.businessName}`);
        res.status(200).json({ success: true, message: "Item claimed successfully!" });

    } catch (error) {
        console.error("Error claiming request:", error);
        res.status(500).json({ error: "Server error while claiming" });
    }
});

app.get('/api/partner/:partnerId/history', async (req, res) => {
    try {
        const history = await Request.find({ claimedBy: req.params.partnerId }).sort({ updatedAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// --- NEW: FEEDBACK ROUTES ---
app.post('/api/feedback', async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json({ success: true, message: "Feedback saved!" });
    } catch (error) {
        console.error("Error saving feedback:", error);
        res.status(500).json({ error: "Failed to save feedback" });
    }
});

app.get('/api/admin/feedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: "Failed to fetch feedback" });
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/requests', async (req, res) => {
    try {
        const requests = await Request.find().populate('claimedBy').sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching admin requests:", error);
        res.status(500).json({ error: "Failed to fetch admin requests" });
    }
});

app.get('/api/admin/partners', async (req, res) => {
    try {
        const partners = await Partner.find().sort({ createdAt: -1 });
        res.status(200).json(partners);
    } catch (error) {
        console.error("Error fetching admin partners:", error);
        res.status(500).json({ error: "Failed to fetch admin partners" });
    }
});

// NEW: Admin Block/Delete Routes
app.patch('/api/admin/partners/:id/block', async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ error: "Partner not found" });

        partner.isBlocked = !partner.isBlocked;
        await partner.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error toggling block status:", error);
        res.status(500).json({ error: "Failed to update partner status" });
    }
});

app.delete('/api/admin/partners/:id', async (req, res) => {
    try {
        const partner = await Partner.findByIdAndDelete(req.params.id);
        if (!partner) return res.status(404).json({ error: "Partner not found" });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error deleting partner:", error);
        res.status(500).json({ error: "Failed to delete partner" });
    }
});

// NEW: Admin Warning Route with Auto-Block functionality
app.post('/api/admin/partners/:id/warn', async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ error: "Partner not found" });

        const { customMessage } = req.body;

        // Increment the warning count (if it doesn't exist, start at 1)
        partner.warningCount = (partner.warningCount || 0) + 1;
        let autoBlocked = false;

        // If warnings reach 5, auto-block them
        if (partner.warningCount >= 5) {
            partner.isBlocked = true;
            autoBlocked = true;
        }

        await partner.save();

        // Send the real email to the partner
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: partner.email,
            subject: `⚠️ OFFICIAL WARNING [${partner.warningCount}/5] - EcoDiagnose Policy Violation`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Official Warning Notice</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear <b>${partner.businessName}</b>,</p>
                        <p>This is an official notice from the EcoDiagnose Administrative Team.</p>
                        
                        <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #991b1b;">Violation Reason:</h4>
                            <p style="margin-bottom: 0;">${customMessage}</p>
                        </div>
                        
                        <p>You currently have <b>${partner.warningCount} out of 5</b> allowed warnings.</p>
                        
                        ${autoBlocked
                    ? `<h3 style="color: #dc2626; border: 2px solid #dc2626; padding: 10px; text-align: center;">🚨 You have reached 5 warnings. Your account has been AUTOMATICALLY BLOCKED.</h3>`
                    : `<p style="font-weight: bold;">If you receive 5 warnings, your account will be permanently blocked from our platform.</p>`
                }
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, warningCount: partner.warningCount, autoBlocked });
    } catch (error) {
        console.error("Error sending warning:", error);
        res.status(500).json({ error: "Failed to send warning" });
    }
});

// NEW: Delete Feedback Route
app.delete('/api/admin/feedback/:id', async (req, res) => {
    try {
        // Find the feedback by ID and delete it
        const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);

        if (!deletedFeedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        res.status(200).json({ success: true, message: "Feedback deleted successfully" });
    } catch (error) {
        console.error("Error deleting feedback:", error);
        res.status(500).json({ error: "Failed to delete feedback" });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));