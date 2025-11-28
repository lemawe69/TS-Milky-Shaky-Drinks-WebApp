const nodemailer = require("nodemailer");
require("dotenv").config();

async function createUserTransporter(userEmail, userPassword) {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: userEmail,
      pass: userPassword,
    },
  });
}

const fallbackTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

fallbackTransporter.verify((err, success) => {
  if (err) {
    console.error('❌ Email service error:', err.message);
  } else {
    console.log('✅ Email service ready');
  }
});

async function sendOrderEmail(to, order, userEmail, userPassword) {
  try {
    if (!to) {
      console.warn('⚠️ No recipient email provided');
      return;
    }

    let transporter = fallbackTransporter;
    let fromEmail = process.env.SMTP_USER;

    if (userEmail && userPassword) {
      try {
        transporter = await createUserTransporter(userEmail, userPassword);
        fromEmail = userEmail;
        console.log(`📧 Using user credentials (${userEmail}) to send email`);
      } catch (err) {
        console.warn(`⚠️ Failed to create user transporter, using fallback: ${err.message}`);
        transporter = fallbackTransporter;
        fromEmail = process.env.SMTP_USER;
      }
    }

    const subtotal = order.subtotal || 0;
    const discount = order.discount || 0;
    const vat = order.vat || 0;
    const total = order.total || 0;

    const isCancellation = order.cancelled === true;
    const headerText = isCancellation ? 'Order Cancelled' : 'Order Confirmed!';
    const headerColor = isCancellation ? '#ef4444' : '#3AB0FF';
    const statusBG = isCancellation ? '#fef2f2' : '#f0fff4';
    const statusBorder = isCancellation ? '#fca5a5' : '#86efac';
    const statusText = isCancellation ? '#7f1d1d' : '#166534';
    const statusMessage = isCancellation 
      ? '✓ Your order has been cancelled. A refund of R' + total.toFixed(2) + ' will be processed within 5-7 business days.'
      : '✓ Your order is confirmed and being prepared';

    const itemsHTML = order.items
      .map(i => `
        <tr style="border-bottom: 1px solid #e8e8e8;">
          <td style="padding: 12px; text-align: left;">${i.qty || 1}x</td>
          <td style="padding: 12px; text-align: left;">
            <strong>${i.flavour}</strong><br/>
            <span style="font-size: 13px; color: #666;">${i.consistency}${i.topping ? ` • ${i.topping}` : ''}</span>
          </td>
          <td style="padding: 12px; text-align: right; font-weight: bold;">R${((i.itemPrice || 0) * (i.qty || 1)).toFixed(2)}</td>
        </tr>
      `)
      .join("");

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; color: #333; background: linear-gradient(135deg, #08121A 0%, #0F1720 100%); padding: 40px 20px; min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
        
        
        <div style="background: linear-gradient(135deg, ${headerColor} 0%, ${isCancellation ? '#dc2626' : '#2A7FCC'} 100%); padding: 30px 20px; text-align: center; color: white;">
          <h1 style="font-size: 32px; margin: 0; font-weight: 700;">🥤 Milky Shaky</h1>
          <p style="font-size: 14px; margin: 8px 0 0 0; opacity: 0.9;">${headerText}</p>
        </div>

       
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; margin: 0 0 20px 0;">Hi <strong>${order.customerName || "Customer"}</strong>,</p>
          <p style="font-size: 15px; color: #666; margin: 0 0 25px 0; line-height: 1.6;">${isCancellation ? 'Your order has been cancelled successfully.' : 'Thanks for ordering with us! Your delicious shake is being prepared.'} Here\'s a summary of your order:</p>

         
          <div style="background-color: #f8f9fa; border-left: 4px solid ${isCancellation ? '#ef4444' : '#3AB0FF'}; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0 0 15px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Order #${order.id}</p>
            
        
            <table style="width: 100%; border-collapse: collapse;">
              ${order.items && order.items.length > 0 ? itemsHTML : '<tr><td style="padding: 12px; color: #999;">No items</td></tr>'}
            </table>

            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e8e8e8;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Subtotal:</span>
                <span>R${subtotal.toFixed(2)}</span>
              </div>
              ${discount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #27ae60; font-weight: 600;">Discount:</span>
                <span style="color: #27ae60; font-weight: 600;">-R${discount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #666;">VAT (15%):</span>
                <span>R${vat.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: ${isCancellation ? '#ef4444' : '#3AB0FF'};">
                <span>${isCancellation ? 'Refund Amount:' : 'Total:'}</span>
                <span>R${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          ${!isCancellation ? `
          <!-- Pickup Info -->
          <div style="background-color: #e8f4ff; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #3AB0FF;">📍 Pickup Details</p>
            <p style="margin: 0 0 5px 0; color: #333; font-size: 15px;">
              <strong>Location:</strong> ${order.restaurant || 'TBD'}
            </p>
            <p style="margin: 0; color: #333; font-size: 15px;">
              <strong>Time:</strong> ${order.pickupAt ? new Date(order.pickupAt).toLocaleString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
            </p>
          </div>
          ` : ''}

          <!-- CTA -->
          <p style="font-size: 16px; text-align: center; margin: 30px 0; color: #666;">${isCancellation ? '💔 We\'ll miss you!' : '🎉 Enjoy your delicious milkshake!'}</p>
          
          <!-- Status -->
          <div style="background-color: ${statusBG}; border: 1px solid ${statusBorder}; border-radius: 8px; padding: 15px; text-align: center;">
            <p style="margin: 0; color: ${statusText}; font-size: 14px; font-weight: 500;">${statusMessage}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e8e8e8;">
          <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
            © 2025 Milky Shaky Drinks. All rights reserved.
          </p>
          <p style="margin: 0; color: #bbb; font-size: 11px;">
            Making delicious milkshakes at your convenience.
          </p>
        </div>
      </div>
    </div>
    `;

    const mailOptions = {
      from: `"Milky Shaky" <${fromEmail}>`,
      to: to,
      subject: isCancellation ? `Order Cancelled — #${order.id}` : `Order Confirmation — #${order.id}`,
      html: html,
    };

    console.log(`📧 Sending ${isCancellation ? 'cancellation' : 'receipt'} email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('❌ Error sending email:', err.message);
    throw err;
  }
}

module.exports = { sendOrderEmail };
