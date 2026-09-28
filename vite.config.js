import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';

function otpMailPlugin(env) {
  return {
    name: 'otp-mail-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // --- 1. Endpoint: /api/send-otp ---
        if (req.url === '/api/send-otp' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { email, name, otp } = JSON.parse(body || '{}');
              if (!email || !otp) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Missing email or otp' }));
              }

              const user = env.SMTP_USER || 'civicsenseweb12@gmail.com';
              const pass = (env.SMTP_PASS || 'civicsense12@').replace(/\s+/g, '');
              const host = env.SMTP_HOST || 'smtp.gmail.com';
              const port = Number(env.SMTP_PORT || 587);

              const mailHtml = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; padding: 10px 16px; background: #ecfdf5; border-radius: 12px; margin-bottom: 12px;">
                      <span style="font-size: 24px;">🌱</span>
                      <strong style="color: #065f46; font-size: 20px; vertical-align: middle; margin-left: 6px;">CivicSense</strong>
                    </div>
                    <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0;">Login Verification Code</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Civic & Waste Management Portal</p>
                  </div>
                  
                  <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #f1f5f9;">
                    <p style="color: #334155; font-size: 15px; margin: 0 0 12px 0;">Hello <strong>${name || 'Citizen'}</strong>,</p>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                      Use the 4-digit verification code below to complete your login. This code is valid for <strong>5 minutes</strong>.
                    </p>
                    <div style="text-align: center; margin: 24px 0 12px 0;">
                      <div style="display: inline-block; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #047857; background: #ffffff; padding: 14px 28px; border-radius: 10px; border: 2px solid #a7f3d0; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                        ${otp}
                      </div>
                    </div>
                  </div>

                  <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0; text-align: center;">
                    If you did not request this code, please disregard this email. Never share your OTP with anyone.
                  </p>
                  <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                  <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
                    &copy; 2026 CivicSense Portal • Automated Security Message
                  </p>
                </div>
              `;

              const mailOptions = {
                from: `"CivicSense Support" <${user}>`,
                to: email,
                subject: `${otp} is your CivicSense OTP verification code`,
                text: `Hello ${name || 'Citizen'}, your CivicSense verification code is: ${otp}. It expires in 5 minutes.`,
                html: mailHtml,
              };

              // Send with primary credentials (civicsense12@), fallback to app password if Gmail 2FA requires app token
              try {
                const transporter = nodemailer.createTransport({
                  host,
                  port,
                  secure: port === 465,
                  auth: { user, pass },
                });
                await transporter.sendMail(mailOptions);
              } catch (primaryErr) {
                if (pass !== 'rjggitetedqixysp') {
                  const fallbackTransporter = nodemailer.createTransport({
                    host,
                    port,
                    secure: port === 465,
                    auth: { user, pass: 'rjggitetedqixysp' },
                  });
                  await fallbackTransporter.sendMail(mailOptions);
                } else {
                  throw primaryErr;
                }
              }

              console.log(`[CivicSense] Real OTP email successfully sent to: ${email}`);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, message: 'OTP sent to email successfully' }));
            } catch (error) {
              console.error('[CivicSense Mailer Error]:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: error.message || 'Failed to send email' }));
            }
          });
        }
        // --- 2. Endpoint: /api/send-status-email ---
        else if (req.url === '/api/send-status-email' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const {
                recipientEmail,
                citizenName,
                complaintNumber,
                issueType,
                locationName,
                status,
                note,
                supervisorName,
                department,
                priorityScore,
              } = JSON.parse(body || '{}');

              if (!recipientEmail || !complaintNumber) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Missing recipientEmail or complaintNumber' }));
              }

              const user = env.SMTP_USER || 'civicsenseweb12@gmail.com';
              const pass = (env.SMTP_PASS || 'civicsense12@').replace(/\s+/g, '');
              const host = env.SMTP_HOST || 'smtp.gmail.com';
              const port = Number(env.SMTP_PORT || 587);

              // Status configuration
              let statusTitle = 'Complaint Update';
              let statusColor = '#0284c7';
              let statusBadgeText = status;
              let statusEmoji = '📢';

              switch (status) {
                case 'SUBMITTED':
                case 'PRIORITIZED':
                  statusTitle = 'Complaint Submitted & Prioritized';
                  statusColor = '#d97706';
                  statusBadgeText = '🟡 Pending Assignment / Prioritized';
                  statusEmoji = '📝';
                  break;
                case 'ASSIGNED':
                  statusTitle = 'Field Supervisor Assigned';
                  statusColor = '#2563eb';
                  statusBadgeText = `📋 Assigned to ${supervisorName || 'Supervisor'}`;
                  statusEmoji = '🧰';
                  break;
                case 'IN_PROGRESS':
                  statusTitle = 'Work In Progress on Your Complaint';
                  statusColor = '#0284c7';
                  statusBadgeText = '🔵 In Progress (Field Team Active)';
                  statusEmoji = '🚚';
                  break;
                case 'ADMIN_MODIFIED':
                  statusTitle = 'Your Complaint Has Been Modified by Administrator';
                  statusColor = '#7c3aed';
                  statusBadgeText = '🛠️ Modified & Updated by City Administrator';
                  statusEmoji = '✏️';
                  break;
                case 'RESOLVED':
                case 'RESOLUTION_SUBMITTED':
                  statusTitle = 'Civic Issue Resolved!';
                  statusColor = '#059669';
                  statusBadgeText = '🟢 Resolved & Completed';
                  statusEmoji = '✅';
                  break;
                default:
                  statusTitle = `Complaint Status: ${status}`;
                  statusColor = '#475569';
                  statusBadgeText = `ℹ️ ${status}`;
                  statusEmoji = '📌';
              }

              const mailHtml = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                  <!-- Header -->
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; padding: 8px 14px; background: #ecfdf5; border-radius: 10px; margin-bottom: 12px;">
                      <span style="font-size: 20px;">🌱</span>
                      <strong style="color: #065f46; font-size: 18px; vertical-align: middle; margin-left: 6px;">CivicSense</strong>
                    </div>
                    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0;">${statusEmoji} ${statusTitle}</h2>
                    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Smart Civic & Waste Management Notification</p>
                  </div>

                  <!-- Greeting -->
                  <p style="color: #334155; font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${citizenName || 'Citizen'}</strong>,</p>
                  <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                    ${status === 'ADMIN_MODIFIED'
                      ? `Your registered civic complaint <strong>${complaintNumber}</strong> has been officially modified and updated by the City Administrator.`
                      : `There is an official status update regarding your registered civic report <strong>${complaintNumber}</strong>.`}
                  </p>

                  <!-- Status Banner -->
                  <div style="background-color: #f8fafc; border-left: 4px solid ${statusColor}; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f5f9; border-left-width: 4px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: ${statusColor}; margin-bottom: 6px;">
                      Current Status
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #0f172a;">
                      ${statusBadgeText}
                    </div>
                    ${note ? `<div style="font-size: 13px; color: #475569; margin-top: 8px; line-height: 1.4; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px dashed #cbd5e1;"><strong>Update Note:</strong> ${note}</div>` : ''}
                  </div>

                  <!-- Issue Details Table -->
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Complaint ID:</td>
                      <td style="padding: 8px 0; font-weight: 700; color: #0f172a; text-align: right;">${complaintNumber}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Issue Type:</td>
                      <td style="padding: 8px 0; font-weight: 600; color: #0f172a; text-align: right;">${issueType || 'Civic Issue'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Location:</td>
                      <td style="padding: 8px 0; color: #0f172a; text-align: right;">📍 ${locationName || 'Chennai'}</td>
                    </tr>
                    ${department ? `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Assigned Dept:</td>
                      <td style="padding: 8px 0; color: #0f172a; text-align: right;">${department}</td>
                    </tr>` : ''}
                    ${supervisorName ? `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 8px 0; color: #64748b;">Supervisor:</td>
                      <td style="padding: 8px 0; font-weight: 600; color: #0f172a; text-align: right;">🧰 ${supervisorName}</td>
                    </tr>` : ''}
                    ${priorityScore ? `
                    <tr>
                      <td style="padding: 8px 0; color: #64748b;">AI Priority Score:</td>
                      <td style="padding: 8px 0; font-weight: 700; color: #047857; text-align: right;">${priorityScore}/100</td>
                    </tr>` : ''}
                  </table>

                  <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0; text-align: center;">
                    You can track full timeline progress and communicate directly with your assigned supervisor on the CivicSense portal.
                  </p>

                  <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                  <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
                    &copy; 2026 CivicSense Portal • Updates sent from civicsenseweb12@gmail.com
                  </p>
                </div>
              `;

              const mailOptions = {
                from: `"CivicSense Support" <${user}>`,
                to: recipientEmail,
                subject: status === 'ADMIN_MODIFIED'
                  ? `[${complaintNumber}] Notice: Your Complaint Has Been Modified by Administrator`
                  : `[${complaintNumber}] Update: ${statusTitle}`,
                text: status === 'ADMIN_MODIFIED'
                  ? `Hello ${citizenName || 'Citizen'}, notice regarding complaint ${complaintNumber}: Your complaint has been modified by the Administrator. Update Note: ${note || 'Details were updated during administrative review.'}`
                  : `Hello ${citizenName || 'Citizen'}, update on complaint ${complaintNumber}: Status is now ${status}. ${note || ''}`,
                html: mailHtml,
              };

              try {
                const transporter = nodemailer.createTransport({
                  host,
                  port,
                  secure: port === 465,
                  auth: { user, pass },
                });
                await transporter.sendMail(mailOptions);
              } catch (primaryErr) {
                if (pass !== 'rjggitetedqixysp') {
                  const fallbackTransporter = nodemailer.createTransport({
                    host,
                    port,
                    secure: port === 465,
                    auth: { user, pass: 'rjggitetedqixysp' },
                  });
                  await fallbackTransporter.sendMail(mailOptions);
                } else {
                  throw primaryErr;
                }
              }

              console.log(`[CivicSense] Status update email sent to ${recipientEmail} for ${complaintNumber} (${status})`);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, message: 'Status email sent successfully' }));
            } catch (error) {
              console.error('[CivicSense Status Mailer Error]:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: error.message || 'Failed to send status email' }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), otpMailPlugin(env)],
  };
});
