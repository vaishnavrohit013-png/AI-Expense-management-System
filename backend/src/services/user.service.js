import UserModel from "../models/user.model.js";
import { NotFoundException } from "../utils/app-error.js";
import { sendEmail } from "../mailers/mailer.js";
import { formatCurrency } from "../utils/format-currency.js";

export const findByIdUserService = async (userId) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};

export const updateUserService = async (
  userId,
  body,
  profilePic
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  const oldBudget = user.monthlyBudget || 0;

  if (profilePic) {
    user.profilePicture = profilePic.path;
  }

  // Update budget only if provided in body
  if (body.monthlyBudget !== undefined) {
    const newBudget = Number(body.monthlyBudget);
    
    // EMAIL LOGIC: Only send if budget increased
    if (newBudget > oldBudget) {
      try {
          const frontendUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
          await sendEmail({
              to: user.email,
              subject: "🚀 Budget Increased - Spendly",
              text: `Hi ${user.name}, your monthly budget has been increased from ${formatCurrency(oldBudget)} to ${formatCurrency(newBudget)}.`,
              html: `
                  <div style="background-color: #f8fafc; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                      
                      <!-- Header -->
                      <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                        <img src="https://res.cloudinary.com/drimd2bca/image/upload/v1711234567/spendly_logo_white.png" alt="Spendly" style="height: 32px;" onerror="this.style.display='none'">
                        <div style="color: #ffffff; font-size: 24px; font-weight: bold; margin-top: 8px;">Spendly</div>
                      </div>

                      <!-- Content -->
                      <div style="padding: 40px 30px; text-align: center;">
                        
                        <!-- Badge -->
                        <div style="display: inline-block; background-color: #eff6ff; color: #3b82f6; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 25px;">
                          🚀 Budget Updated!
                        </div>

                        <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 10px 0;">Hi ${user.name.split(' ')[0]},</h2>
                        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Your <strong>Overall Monthly Wallet</strong> budget has been successfully increased to give you more room to manage your finances.
                        </p>

                        <!-- Budget Card -->
                        <div style="border: 1px solid #f1f5f9; border-radius: 12px; display: flex; text-align: left; margin-bottom: 30px;">
                          <div style="flex: 1; padding: 20px; border-right: 1px solid #f1f5f9;">
                            <div style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">OLD BUDGET</div>
                            <div style="color: #64748b; font-size: 20px; font-weight: 700; text-decoration: line-through;">${formatCurrency(oldBudget)}</div>
                          </div>
                          <div style="flex: 1; padding: 20px;">
                            <div style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">NEW LIMIT</div>
                            <div style="color: #1e293b; font-size: 20px; font-weight: 700;">${formatCurrency(newBudget)}</div>
                          </div>
                        </div>

                        <p style="color: #64748b; font-size: 14px; margin-bottom: 35px;">
                          Happy spending and saving! Keep an eye on your new limit to finish the month strong.
                        </p>

                        <!-- Action Button -->
                        <a href="${frontendUrl}/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 40px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 15px;">
                          View Dashboard
                        </a>

                        <!-- Footer -->
                        <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #f1f5f9; text-align: left;">
                          <p style="color: #64748b; font-size: 14px; margin: 0;">Always here to help,</p>
                          <p style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 4px 0 0 0;">Spendly Team</p>
                        </div>

                      </div>
                    </div>
                  </div>
              `
          });
          console.log(`📧 [Budget Alert] Instant email delivered to ${user.email}`);
      } catch (err) {
          console.error("❌ [Budget Alert Failed]:", err.message);
      }
    }
    user.monthlyBudget = newBudget;
  }

  if (body.name) {
    user.name = body.name;
  }

  await user.save();

  return user.omitPassword();
};
