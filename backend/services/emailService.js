import crypto from 'crypto';

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP Verification Email via Resend
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.otp - 6-digit verification code
 * @param {string} params.purpose - 'signup' | 'email_update' | 'forgot_password'
 * @param {string} [params.username] - Optional username for personalized greeting
 */
export const sendOtpEmail = async ({ to, otp, purpose, username }) => {
    let subject = `${otp} is your Reviewpedia verification code`;
    let titleText = 'Verify Your Email';
    let actionDesc = 'Thank you for joining Reviewpedia! Please use the following 6-digit verification code to complete your registration:';

    if (purpose === 'email_update') {
        subject = `${otp} is your Reviewpedia email change code`;
        titleText = 'Confirm Email Change';
        actionDesc = 'You requested to update your Reviewpedia account email address. Please use the following 6-digit verification code to confirm this change:';
    } else if (purpose === 'forgot_password') {
        subject = `${otp} is your Reviewpedia password reset code`;
        titleText = 'Reset Your Password';
        actionDesc = 'You requested to reset your Reviewpedia account password. Please use the following 6-digit verification code to set your new password:';
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #1e293b; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 32px 32px 20px 32px; text-align: center;">
                                <div style="display: inline-block; padding: 10px 18px; background: linear-gradient(135deg, #0ea5e9, #0284c7); border-radius: 12px; margin-bottom: 16px;">
                                    <span style="font-size: 1.25rem; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Reviewpedia</span>
                                </div>
                                <h1 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: #ffffff;">${titleText}</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 0 32px 24px 32px; text-align: center;">
                                <p style="margin: 0 0 24px 0; font-size: 0.95rem; color: #94a3b8; line-height: 1.6;">
                                    ${username ? `Hi <strong>${username}</strong>,<br>` : ''}${actionDesc}
                                </p>
                                <!-- OTP Code Box -->
                                <div style="background-color: #0f172a; border: 1px solid #0ea5e9; border-radius: 12px; padding: 18px; margin: 0 auto 24px auto; max-width: 280px; text-align: center;">
                                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 2.2rem; font-weight: 800; letter-spacing: 8px; color: #38bdf8;">${otp}</span>
                                </div>
                                <p style="margin: 0; font-size: 0.82rem; color: #64748b;">
                                    This code is valid for <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
                                <p style="margin: 0; font-size: 0.75rem; color: #64748b;">
                                    © ${new Date().getFullYear()} Reviewpedia. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    // Always log OTP to server console (very helpful for local development and debugging)
    console.log(`\n======================================================`);
    console.log(`🔑 [REVIEWPEDIA OTP] Purpose: ${purpose.toUpperCase()}`);
    console.log(`📧 To: ${to}`);
    console.log(`🔢 Code: ${otp}`);
    console.log(`======================================================\n`);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('⚠️ WARNING: RESEND_API_KEY is not set in environment. OTP was only logged to console.');
        return { success: true, simulated: true };
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Reviewpedia <onboarding@resend.dev>';

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromAddress,
                to: [to],
                subject,
                html: htmlContent
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.warn('⚠️ Resend API responded with error:', data);
            // If in non-production or sandbox limitation, don't crash so local testing proceeds smoothly
            if (process.env.NODE_ENV !== 'production') {
                return { success: true, simulated: true, warning: data.message };
            }
            throw new Error(data.message || 'Failed to send verification email');
        }

        return { success: true, id: data.id };
    } catch (err) {
        console.error('Failed to send OTP email via Resend:', err.message);
        if (process.env.NODE_ENV !== 'production') {
            return { success: true, simulated: true, warning: err.message };
        }
        throw err;
    }
};
