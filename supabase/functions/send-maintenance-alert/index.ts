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
                  <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">${equipment.next_maintenance}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Operating Hours:</td>
                  <td style="padding: 8px 0;">${equipment.hours_operated}</td>
                </tr>
              </table>
              
              ${customMessage ? `<div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;"><strong>Additional Message:</strong><br>${customMessage}</div>` : ''}
              
              <p style="margin-top: 20px; color: #666;">
                Please schedule maintenance as soon as possible to ensure optimal performance and safety.
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated notification from Machinery Management System</p>
            </div>
          </div>
        </div>
      `
    },
    overdue: {
      subject: `🚨 URGENT: Overdue Maintenance - ${equipment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; border: 2px solid #dc3545;">
            <h2 style="color: #dc3545; margin-bottom: 20px;">🚨 URGENT: Maintenance Overdue</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <h3 style="color: #dc3545; margin-top: 0;">Equipment Details</h3>
              
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
                  <td style="padding: 8px 0; font-weight: bold;">Maintenance Due Date:</td>
                  <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">${equipment.next_maintenance} (OVERDUE)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Operating Hours:</td>
                  <td style="padding: 8px 0;">${equipment.hours_operated}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #fff5f5; border-radius: 4px; border: 1px solid #dc3545;">
                <p style="margin: 0; color: #dc3545; font-weight: bold;">
                  ⚠️ IMMEDIATE ACTION REQUIRED: This equipment has overdue maintenance and should be taken out of service until maintenance is completed.
                </p>
              </div>
              
              ${customMessage ? `<div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;"><strong>Additional Message:</strong><br>${customMessage}</div>` : ''}
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated notification from Machinery Management System</p>
            </div>
          </div>
        </div>
      `
    },
    critical: {
      subject: `🔴 CRITICAL ALERT: ${equipment.name} - Immediate Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff0f0; padding: 20px; border-radius: 8px; border: 3px solid #dc3545;">
            <h2 style="color: #dc3545; margin-bottom: 20px;">🔴 CRITICAL EQUIPMENT ALERT</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <h3 style="color: #dc3545; margin-top: 0;">Critical Equipment Status</h3>
              
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
                  <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">CRITICAL</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Last Maintenance:</td>
                  <td style="padding: 8px 0;">${equipment.last_maintenance}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Operating Hours:</td>
                  <td style="padding: 8px 0;">${equipment.hours_operated}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #fff0f0; border-radius: 4px; border: 2px solid #dc3545;">
                <p style="margin: 0; color: #dc3545; font-weight: bold; font-size: 16px;">
                  🛑 STOP OPERATION IMMEDIATELY<br>
                  Equipment has been marked as CRITICAL. Contact maintenance team for urgent inspection.
                </p>
              </div>
              
              ${customMessage ? `<div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;"><strong>Additional Message:</strong><br>${customMessage}</div>` : ''}
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated critical alert from Machinery Management System</p>
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
    const emailPromises = recipients.map(async (email) => {
      try {
        const emailResponse = await resend.emails.send({
          from: "Machinery Management <alerts@yourdomain.com>",
          to: [email],
          subject: template.subject,
          html: template.html,
        });

        // Log email sent
        await supabaseClient
          .from('maintenance_notifications')
          .insert({
            asset_id: equipmentId,
            notification_type: alertType,
            recipient_email: email,
            sent_at: new Date().toISOString(),
            status: 'sent'
          });

        return { email, success: true, id: emailResponse.data?.id };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        
        // Log email failed
        await supabaseClient
          .from('maintenance_notifications')
          .insert({
            asset_id: equipmentId,
            notification_type: alertType,
            recipient_email: email,
            sent_at: new Date().toISOString(),
            status: 'failed',
            error_message: error.message
          });

        return { email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      message: `Sent ${successful} emails successfully, ${failed} failed`,
      results,
      equipmentName: equipment.name
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