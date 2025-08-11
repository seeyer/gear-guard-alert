import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MaintenanceAlertRequest {
  equipmentId: string;
  alertType: 'maintenance_due' | 'overdue' | 'critical';
  recipients: string[];
  customMessage?: string;
}

interface Equipment {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  location: string;
  next_maintenance: string;
  last_maintenance: string;
  hours_operated: number;
  status: string;
}

const getEmailTemplate = (alertType: string, equipment: Equipment, customMessage?: string) => {
  const templates = {
    maintenance_due: {
      subject: `Maintenance Due - ${equipment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Maintenance Due Notification</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
              <h3 style="color: #007bff; margin-top: 0;">Equipment Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Equipment Name:</td>
                  <td style="padding: 8px 0;">${equipment.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Model:</td>
                  <td style="padding: 8px 0;">${equipment.model}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Serial Number:</td>
                  <td style="padding: 8px 0;">${equipment.serial_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                  <td style="padding: 8px 0;">${equipment.location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Next Maintenance:</td>
                  <td style="padding: 8px 0; color: #007bff; font-weight: bold;">${equipment.next_maintenance}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Current Status:</td>
                  <td style="padding: 8px 0;">${equipment.status}</td>
                </tr>
              </table>
            </div>
            
            ${customMessage ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">Additional Message:</h4>
                <p style="color: #856404; margin-bottom: 0;">${customMessage}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated notification from your Machinery Management System</p>
            </div>
          </div>
        </div>
      `
    },
    overdue: {
      subject: `🚨 OVERDUE Maintenance - ${equipment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc3545; margin-bottom: 20px;">⚠️ OVERDUE MAINTENANCE ALERT</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <h3 style="color: #dc3545; margin-top: 0;">Equipment Requires Immediate Attention</h3>
              
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="color: #721c24; margin: 0; font-weight: bold;">
                  This equipment is overdue for maintenance and may pose safety or operational risks.
                </p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Equipment Name:</td>
                  <td style="padding: 8px 0;">${equipment.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Model:</td>
                  <td style="padding: 8px 0;">${equipment.model}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Serial Number:</td>
                  <td style="padding: 8px 0;">${equipment.serial_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                  <td style="padding: 8px 0;">${equipment.location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Due Date:</td>
                  <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">${equipment.next_maintenance} (OVERDUE)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Current Status:</td>
                  <td style="padding: 8px 0;">${equipment.status}</td>
                </tr>
              </table>
            </div>
            
            ${customMessage ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">Additional Message:</h4>
                <p style="color: #856404; margin-bottom: 0;">${customMessage}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated urgent notification from your Machinery Management System</p>
            </div>
          </div>
        </div>
      `
    },
    critical: {
      subject: `🔴 CRITICAL Alert - ${equipment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc3545; margin-bottom: 20px;">🔴 CRITICAL EQUIPMENT ALERT</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <h3 style="color: #dc3545; margin-top: 0;">IMMEDIATE ACTION REQUIRED</h3>
              
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="color: #721c24; margin: 0; font-weight: bold;">
                  🚨 CRITICAL STATUS: This equipment requires immediate inspection and maintenance.
                </p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Equipment Name:</td>
                  <td style="padding: 8px 0;">${equipment.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Model:</td>
                  <td style="padding: 8px 0;">${equipment.model}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Serial Number:</td>
                  <td style="padding: 8px 0;">${equipment.serial_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                  <td style="padding: 8px 0;">${equipment.location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                  <td style="padding: 8px 0; color: #dc3545; font-weight: bold; text-transform: uppercase;">${equipment.status}</td>
                </tr>
              </table>
            </div>
            
            ${customMessage ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">Additional Message:</h4>
                <p style="color: #856404; margin-bottom: 0;">${customMessage}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated critical alert from your Machinery Management System</p>
            </div>
          </div>
        </div>
      `
    }
  };

  return templates[alertType] || templates.maintenance_due;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { equipmentId, alertType, recipients, customMessage }: MaintenanceAlertRequest = await req.json();

    // Fetch equipment details
    const { data: equipment, error: equipmentError } = await supabaseClient
      .from('assets')
      .select('*')
      .eq('id', equipmentId)
      .single();

    if (equipmentError || !equipment) {
      throw new Error(`Equipment not found: ${equipmentError?.message}`);
    }

    const template = getEmailTemplate(alertType, equipment, customMessage);

    // Send emails to all recipients
    const emailPromises = recipients.map(async (recipient) => {
      try {
        const emailResponse = await resend.emails.send({
          from: "Machinery Alerts <alerts@resend.dev>",
          to: [recipient],
          subject: template.subject,
          html: template.html,
        });

        console.log(`Email sent successfully to ${recipient}:`, emailResponse);

        // Log email success
        await supabaseClient
          .from('maintenance_notifications')
          .insert({
            asset_id: equipmentId,
            notification_type: alertType,
            recipient_email: recipient,
            email_status: 'sent',
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        return { recipient, success: true, messageId: emailResponse.data?.id };
      } catch (error: any) {
        console.error(`Failed to send email to ${recipient}:`, error);
        
        // Log email failure
        await supabaseClient
          .from('maintenance_notifications')
          .insert({
            asset_id: equipmentId,
            notification_type: alertType,
            recipient_email: recipient,
            email_status: 'failed',
            error_message: error.message,
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        return { recipient, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      message: `Sent ${successful} emails successfully, ${failed} failed`,
      results,
      equipmentName: equipment.name,
      alertType
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-maintenance-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);