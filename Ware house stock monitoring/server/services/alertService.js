const Alert = require('../models/Alert');
const sendEmail = require('./emailService');
const User = require('../models/User');

const alertService = {
  // Create a new alert
  async createAlert({ type, severity, title, message, product, warehouse, metadata, io }) {
    try {
      const alert = await Alert.create({
        type,
        severity: severity || 'warning',
        title,
        message,
        product: product || null,
        warehouse: warehouse || null,
        metadata: metadata || {},
      });

      // Emit real-time alert via Socket.IO
      if (io) {
        io.emit('new-alert', alert);
        if (warehouse) {
          io.to(`warehouse-${warehouse}`).emit('warehouse-alert', alert);
        }
      }

      // Send email to admins/managers for critical alerts
      if (severity === 'critical') {
        const managers = await User.find({ role: { $in: ['admin', 'manager'] }, isActive: true });
        for (const mgr of managers) {
          await sendEmail({
            to: mgr.email,
            subject: `[${severity.toUpperCase()}] ${title}`,
            html: `
              <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;">
                <h2 style="color:#dc2626;">⚠️ ${title}</h2>
                <p style="font-size:16px;">${message}</p>
                <p style="color:#666;font-size:14px;">Type: ${type} | Severity: ${severity}</p>
                <hr/>
                <p style="font-size:12px;color:#999;">Warehouse Stock Monitoring System</p>
              </div>
            `,
          });
        }
        await Alert.findByIdAndUpdate(alert._id, { emailSent: true });
      }

      return alert;
    } catch (error) {
      console.error('Alert creation failed:', error.message);
      return null;
    }
  },

  // Get unread alert count
  async getUnreadCount() {
    return await Alert.countDocuments({ isRead: false });
  },
};

module.exports = alertService;
